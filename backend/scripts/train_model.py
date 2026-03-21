import argparse
from pathlib import Path

from app.ml.training import train_model


def main():
    parser = argparse.ArgumentParser(description="Train the DiaSense diabetes risk model.")
    parser.add_argument(
        "--output",
        default="app/ml/artifacts/diabetes_model.pkl",
        help="Path to store the serialized model bundle.",
    )
    parser.add_argument(
        "--model-kind",
        default="logreg",
        choices=["logreg", "xgboost"],
        help="Model family to train.",
    )
    args = parser.parse_args()

    metrics = train_model(Path(args.output), model_kind=args.model_kind)
    print("Training completed with metrics:")
    for key, value in metrics.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
