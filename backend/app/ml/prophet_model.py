from prophet import Prophet


class ProphetModel:

    @staticmethod
    def build():

        model = Prophet(
            growth="linear",
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10,
        )

        return model