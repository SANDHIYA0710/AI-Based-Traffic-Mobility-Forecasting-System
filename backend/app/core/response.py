from typing import Any


class ApiResponse:

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success"
    ):
        return {
            "success": True,
            "message": message,
            "data": data
        }