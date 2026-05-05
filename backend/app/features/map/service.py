"""Map service layer."""

import math

from sqlalchemy.orm import Session

from app.features.map.repository import MapRepository
from app.features.map.schemas import MapRecomputeResponse, MapUserResponse

ZERO_VECTOR_TOLERANCE = 1e-10


class MapService:
    def __init__(self):
        self.repo = MapRepository()

    def recompute_map_positions(self, db: Session) -> MapRecomputeResponse:
        rows = self.repo.list_users_with_embeddings(db)

        if len(rows) < 2:
            return MapRecomputeResponse(
                updated_count=0,
                message="At least 2 users with embeddings are needed to build the map.",
            )

        embeddings = [list(row.embedding) for row in rows]
        coordinates = self._project_embeddings_to_2d(embeddings)

        for row, coordinate in zip(rows, coordinates):
            self.repo.upsert_position(
                db,
                user_id=row.user_id,
                x=coordinate[0],
                y=coordinate[1],
            )

        self.repo.commit_positions(db)

        return MapRecomputeResponse(
            updated_count=len(rows),
            message="Map positions recomputed with PCA projection.",
        )

    def list_map_users(self, db: Session) -> list[MapUserResponse]:
        rows = self.repo.list_map_users(db)

        return [
            MapUserResponse(
                user_id=row.user_id,
                username=row.username,
                display_name=row.display_name,
                x=float(row.x),
                y=float(row.y),
            )
            for row in rows
        ]

    def _project_embeddings_to_2d(
        self,
        embeddings: list[list[float]],
    ) -> list[tuple[float, float]]:
        centered_embeddings = self._center_embeddings(embeddings)
        first_direction = self._principal_direction(centered_embeddings)
        first_scores = self._project_onto_direction(
            centered_embeddings,
            first_direction,
        )

        if len(embeddings) < 3:
            second_scores = [0.0 for _ in embeddings]
        else:
            residual_embeddings = self._remove_direction(
                centered_embeddings,
                first_direction,
                first_scores,
            )
            second_direction = self._principal_direction(residual_embeddings)
            second_scores = self._project_onto_direction(
                centered_embeddings,
                second_direction,
            )

        raw_coordinates = list(zip(first_scores, second_scores))

        return self._center_and_scale(raw_coordinates)

    def _center_embeddings(
        self,
        embeddings: list[list[float]],
    ) -> list[list[float]]:
        dimensions = len(embeddings[0])
        averages = [
            sum(embedding[index] for embedding in embeddings) / len(embeddings)
            for index in range(dimensions)
        ]

        return [
            [
                value - averages[index]
                for index, value in enumerate(embedding)
            ]
            for embedding in embeddings
        ]

    def _principal_direction(
        self,
        centered_embeddings: list[list[float]],
        iterations: int = 40,
    ) -> list[float]:
        dimensions = len(centered_embeddings[0])
        direction = self._initial_direction(centered_embeddings)

        for _ in range(iterations):
            scores = self._project_onto_direction(centered_embeddings, direction)
            next_direction = [
                sum(
                    scores[row_index] * centered_embeddings[row_index][dimension]
                    for row_index in range(len(centered_embeddings))
                )
                for dimension in range(dimensions)
            ]
            direction = self._normalize_vector(next_direction)

            if not any(direction):
                return [0.0 for _ in range(dimensions)]

        return direction

    def _initial_direction(
        self,
        centered_embeddings: list[list[float]],
    ) -> list[float]:
        for embedding in centered_embeddings:
            direction = self._normalize_vector(embedding)
            if any(direction):
                return direction

        return [0.0 for _ in centered_embeddings[0]]

    def _project_onto_direction(
        self,
        embeddings: list[list[float]],
        direction: list[float],
    ) -> list[float]:
        return [
            sum(value * direction[index] for index, value in enumerate(embedding))
            for embedding in embeddings
        ]

    def _remove_direction(
        self,
        embeddings: list[list[float]],
        direction: list[float],
        scores: list[float],
    ) -> list[list[float]]:
        return [
            [
                value - (scores[row_index] * direction[index])
                for index, value in enumerate(embedding)
            ]
            for row_index, embedding in enumerate(embeddings)
        ]

    def _normalize_vector(self, values: list[float]) -> list[float]:
        length = math.sqrt(sum(value * value for value in values))

        if length < ZERO_VECTOR_TOLERANCE:
            return [0.0 for _ in values]

        return [value / length for value in values]

    def _center_and_scale(
        self,
        coordinates: list[tuple[float, float]],
    ) -> list[tuple[float, float]]:
        average_x = sum(x for x, _ in coordinates) / len(coordinates)
        average_y = sum(y for _, y in coordinates) / len(coordinates)

        centered = [(x - average_x, y - average_y) for x, y in coordinates]
        distances = sorted(max(abs(x), abs(y)) for x, y in centered)
        scale_index = max(0, min(len(distances) - 1, int(len(distances) * 0.85)))
        scale_distance = distances[scale_index]

        if scale_distance == 0:
            return [(0.0, 0.0) for _ in centered]

        return [
            (
                max(-1.0, min(1.0, x / scale_distance)),
                max(-1.0, min(1.0, y / scale_distance)),
            )
            for x, y in centered
        ]
