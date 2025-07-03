from flask import Flask, render_template, request, send_from_directory
from song_db import Database
from collections import defaultdict
import json
import os

app = Flask(__name__)
artists_map = {
    "5sos": 0,
    "chainsmokers": 1,
    "radwimps": 2,
    "queen": 3,
    "kitri": 4,
}

reverse_artists_map = dict(reversed(item) for item in artists_map.items())

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/artists")
def artists():
    return render_template("artists.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/search")
def search():
    return render_template("search.html")


@app.route("/spotlight")
def spotlight():
    return render_template("spotlight.html")


@app.route("/<name>")
def artist(name: str):
    with app.open_resource(f"static/artists/{name}.json") as f:
        data = json.load(f)

    return render_template("artist.html", **data)


@app.route("/<name>/<int:album_index>")
def album(name: str, album_index: int):
    with app.open_resource(f"static/artists/{name}.json") as f:
        data = json.load(f)

    db = Database()
    songIDs = db.get_songs(artists_map[name], album_index)
    db.close()
    return render_template(
        "album.html", **data, album_index=album_index, songIDs=songIDs
    )


@app.route("/toggle_song", methods=["POST"])
def toggle_song():
    song_data = json.loads(request.get_data().decode("UTF-8"))
    db = Database()
    db.toggle_song(song_data["artistID"], song_data["albumID"], song_data["songID"])
    db.close()
    return {}


@app.route("/playlist")
def playlist():
    db = Database()
    songs = db.get_all_songs()
    db.close()
    artist_dict = defaultdict(list)
    for song in sorted(songs):
        artist_dict[song[0]].append(song[1:])

    tracks = []
    for artist_id, artist_songs in artist_dict.items():
        with app.open_resource(
            f"static/artists/{reverse_artists_map[artist_id]}.json"
        ) as f:
            artist_data = json.load(f)

        for album_id, song_id in artist_songs:
            track = artist_data["albums"][album_id]["tracks"][song_id]
            track["artist"] = artist_data["full_name"]
            track["artist_id"] = artist_id
            track["album_id"] = album_id
            track["song_id"] = song_id
            tracks.append(artist_data["albums"][album_id]["tracks"][song_id])

    return render_template("playlist.html", tracks=tracks)


if __name__ == "__main__":
    app.run(debug=True)
