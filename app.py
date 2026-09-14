from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

app = Flask(__name__)


# ================= HOME =================

@app.route("/")
def home():
    return render_template("dashboard.html")


# ================= SENSOR DATA =================

@app.route("/api/sensor-data")
def sensor_data():

    with open("sensor_data.json", "r") as file:
        data = json.load(file)

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
        warnings.append("High fire-risk indicator detected")

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


# ================= STATIC FILES =================
# Supports CSS, JavaScript, images and MP4 videos
# stored in the GitHub repository root.

@app.route("/static/<path:filename>",)
def static_files(filename):

    # First check repository root
    root_file = os.path.join(".", filename)

    if os.path.isfile(root_file):
        return send_from_directory(
            ".",
            filename,
            conditional=True
        )

    # Then check normal static folder
    static_file = os.path.join("static", filename)

    if os.path.isfile(static_file):
        return send_from_directory(
            "static",
            filename,
            conditional=True
        )

    return "File not found", 404


# ================= RUN =================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001))
    )
