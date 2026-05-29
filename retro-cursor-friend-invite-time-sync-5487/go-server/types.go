package main

type PlayerColor string

const (
	PlayerWhite PlayerColor = "white"
	PlayerBlack PlayerColor = "black"
)

type RoomStatus string

const (
	StatusWaiting   RoomStatus = "waiting"
	StatusActive    RoomStatus = "active"
	StatusCheckmate RoomStatus = "checkmate"
	StatusDraw      RoomStatus = "draw"
	StatusTimeout   RoomStatus = "timeout"
)

type RoomPlayer struct {
	ID    string      `json:"id"`
	Name  string      `json:"name"`
	Color PlayerColor `json:"color"`
}

type LastMove struct {
	From string `json:"from"`
	To   string `json:"to"`
	SAN  string `json:"san"`
}

type RoomPlayers struct {
	White *RoomPlayer `json:"white"`
	Black *RoomPlayer `json:"black"`
}

type PlayerDisconnected struct {
	White bool `json:"white"`
	Black bool `json:"black"`
}

type DisconnectTimerMs struct {
	White int64 `json:"white"`
	Black int64 `json:"black"`
}

type RoomSnapshot struct {
	RoomID         string              `json:"roomId"`
	Status         RoomStatus          `json:"status"`
	FEN            string              `json:"fen"`
	PGN            string              `json:"pgn"`
	Turn           PlayerColor         `json:"turn"`
	Winner         *PlayerColor        `json:"winner"`
	DrawReason     *string             `json:"drawReason"`
	LastMove       *LastMove           `json:"lastMove"`
	Moves          []string            `json:"moves"`
	Players        RoomPlayers         `json:"players"`
	SpectatorCount int                 `json:"spectatorCount"`
	TimeControlMs  int64               `json:"timeControlMs"`
	IncrementMs    int64               `json:"incrementMs"`
	WhiteTimeMs    int64               `json:"whiteTimeMs"`
	BlackTimeMs    int64               `json:"blackTimeMs"`
	ActiveSince    *int64              `json:"activeSince"`
	CreatedAt      int64               `json:"createdAt"`
	UpdatedAt      int64               `json:"updatedAt"`
	PlayerDisconnected *PlayerDisconnected `json:"playerDisconnected,omitempty"`
	DisconnectTimerMs   *DisconnectTimerMs   `json:"disconnectTimerMs,omitempty"`
}

type RoomSession struct {
	Token    string       `json:"token"`
	PlayerID string       `json:"playerId"`
	Color    *PlayerColor `json:"color"`
	Name     string       `json:"name"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
