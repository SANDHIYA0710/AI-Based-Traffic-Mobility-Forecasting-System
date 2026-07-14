REQUIRED_COLUMNS = [
    "timestamp",
    "route_code",
    "vehicle_count",
    "average_speed",
    "congestion_level",
]


def validate_columns(df):
    missing = []

    for column in REQUIRED_COLUMNS:
        if column not in df.columns:
            missing.append(column)

    return missing