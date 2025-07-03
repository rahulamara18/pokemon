import sqlite3
import os


class Database:
    def __init__(self) -> None:
        self.connection = sqlite3.connect("sonuscloud.db")
        self.cursor = self.connection.cursor()
        if not self.__table_exists():
            self.__create_table()

    def toggle_song(self, artist_id: int, album_id: int, song_id: int) -> None:
        if self.__song_exists(artist_id, album_id, song_id):
            self.__remove_song(artist_id, album_id, song_id)
        else:
            self.__insert_song(artist_id, album_id, song_id)

    def __table_exists(self) -> bool:
        self.cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='SONGS'"
        )
        return len(self.cursor.fetchall()) == 1

    def __create_table(self) -> None:
        self.cursor.execute(
            "CREATE TABLE SONGS(ARTIST_ID INTEGER NOT NULL, ALBUM_ID INTEGER NOT NULL, SONG_ID INTEGER NOT NULL, PRIMARY KEY(ARTIST_ID, ALBUM_ID, SONG_ID));"
        )
        self.connection.commit()

    def __delete_table(self) -> None:
        self.cursor.execute("DROP TABLE SONGS")
        self.connection.commit()

    def __song_exists(self, artist_id: int, album_id: int, song_id: int) -> bool:
        self.cursor.execute(
            f"SELECT * FROM SONGS WHERE ARTIST_ID = {artist_id} AND ALBUM_ID = {album_id} AND SONG_ID = {song_id}"
        )
        return len(self.cursor.fetchall()) != 0

    def __insert_song(self, artist_id: int, album_id: int, song_id: int) -> None:
        self.cursor.execute(
            f"INSERT INTO SONGS(ARTIST_ID, ALBUM_ID, SONG_ID) VALUES({artist_id}, {album_id}, {song_id})"
        )
        self.connection.commit()

    def __remove_song(self, artist_id: int, album_id: int, song_id: int) -> None:
        self.cursor.execute(
            f"DELETE FROM SONGS WHERE ARTIST_ID = {artist_id} AND ALBUM_ID = {album_id} AND SONG_ID = {song_id}"
        )
        self.connection.commit()

    def print_database(self) -> None:
        self.cursor.execute("SELECT * FROM SONGS")
        for row in self.cursor.fetchall():
            print(*row)

    def get_songs(self, artist_id: int, album_id: int) -> list[int]:
        self.cursor.execute(
            f"SELECT SONG_ID FROM SONGS WHERE ARTIST_ID = {artist_id} AND ALBUM_ID = {album_id}"
        )
        return [song[0] for song in self.cursor.fetchall()]

    def get_all_songs(self) -> list[tuple[int, int, int]]:
        self.cursor.execute("SELECT * FROM SONGS")
        return self.cursor.fetchall()

    def close(self) -> None:
        self.connection.close()


if __name__ == "__main__":
    db = Database()
    while True:
        choice = input("[0] Toggle\n[1] Query\n[2] Print Table\n")
        if choice == "0":
            song_input = map(int, input().split())
            db.toggle_song(*song_input)
        elif choice == "1":
            song_input = map(int, input().split())
            print(db.get_songs(*song_input))
        elif choice == "2":
            db.print_database()
        else:
            break
    db.close()
