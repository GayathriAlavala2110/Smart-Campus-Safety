from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

# Use the project root for templates and disable Flask's default static handler
app = Flask(__name__, template_folder=".", static_folder=None)


@app.route("/")
def home():
    return render_template("dashboard.html")


def load_sensor_data():
    # Works both locally and on Render
    possible_files = [
        "sensor_data.json",
        os.path.join("data", "sensor_data.json")
    ]

    for file_path in possible_files:
        if os.path.isfile(file_path):
            with open(file_path, "r") as file:
                return json.load(file)

    raise FileNotFoundError("sensor_data.json not found")


@app.route("/api/sensor-data")
def sensor_data():

    data = load_sensor_data()

    temperature = data["temperature"]
    humidity = data["humidity"]
    air_quality = data["air_quality"]
    smoke_level = data["smoke_level"]

    warnings = []

    if temperature >= 40:
        warnings.append("High temperature detected")

    if humidity >= 85:
        warnings.append("High humidity detected")

    if air_quality >= 55:
        warnings.append("Poor air quality detected")

    if smoke_level >= 50:
        warnings.append("High fire risk detected")

    if warnings:
        risk = "🔴 HIGH"
        message = "Immediate attention required."
        reason = ", ".join(warnings)

    elif (
        temperature >= 35
        or humidity >= 75
        or air_quality >= 35
        or smoke_level >= 25
    ):
        risk = "🟠 MEDIUM"
        message = "Monitoring required."
        reason = "One or more environmental values require monitoring."

    else:
        risk = "🟢 NORMAL"
        message = "Campus conditions are currently normal."
        reason = "No safety risks detected."

    data["risk"] = risk
    data["message"] = message
    data["reason"] = reason

    return jsonify(data)


# Custom static-file handler for files stored in the project root
@app.route("/static/<path:filename>", endpoint="static")
def static_files(filename):

    # Check project root first
    if os.path.isfile(filename):
        return send_from_directory(".", filename, conditional=True)

    # Then check the static folder
    static_path = os.path.join("static", filename)

    if os.path.isfile(static_path):
        return send_from_directory(
            "static",
            filename,
            conditional=True
        )

    return "File not found", 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001))
    )
