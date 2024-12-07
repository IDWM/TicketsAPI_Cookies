const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware para manejar JSON y cookies
app.use(express.json());
app.use(cors({
    origin : true,
    credentials: true, 
}));
app.use(cookieParser());

app.post("/tickets", (req, res) => {
    const { id, title, description } = req.body;

    if (!id || !title || !description) {
        return res.status(400).json({ message: "Faltan datos del ticket" });
    }

    // Recuperar los tickets existentes de las cookies
    const tickets = req.cookies.tickets ? JSON.parse(req.cookies.tickets) : [];

    // Verificar si el ticket ya existe
    if (tickets.some((ticket) => ticket.id === id)) {
        return res.status(400).json({ message: "El ticket ya existe" });
    }

    // Agregar el nuevo ticket
    tickets.push({ id, title, description });

    // Guardar la lista actualizada en las cookies
    res.cookie("tickets", JSON.stringify(tickets), {
        httpOnly: false, // Permite acceso desde Angular
        sameSite: "lax", // Seguridad básica para CORS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(201).json({ message: "Ticket creado", ticket: { id, title, description } });
});

app.get("/tickets", (req, res) => {
    // Recuperar los tickets de las cookies
    const tickets = req.cookies.tickets ? JSON.parse(req.cookies.tickets) : [];
    res.json({ tickets });
});


// Actualizar un ticket (Update)
app.put("/tickets/:id", (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Faltan datos para actualizar el ticket" });
    }

    // Recuperar cookies actuales
    const tickets = req.cookies.tickets ? JSON.parse(req.cookies.tickets) : [];

    // Buscar y actualizar el ticket
    const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);
    if (ticketIndex === -1) {
        return res.status(404).json({ message: "Ticket no encontrado" });
    }

    tickets[ticketIndex] = { id, title, description };

    // Guardar los cambios en las cookies
    res.cookie("tickets", JSON.stringify(tickets), { httpOnly: false });
    res.json({ message: "Ticket actualizado", ticket: tickets[ticketIndex] });
});

// Eliminar un ticket (Delete)
app.delete("/tickets/:id", (req, res) => {
    const { id } = req.params;

    // Recuperar cookies actuales
    const tickets = req.cookies.tickets ? JSON.parse(req.cookies.tickets) : [];

    // Filtrar los tickets
    const filteredTickets = tickets.filter((ticket) => ticket.id !== id);

    if (tickets.length === filteredTickets.length) {
        return res.status(404).json({ message: "Ticket no encontrado" });
    }

    // Guardar los tickets actualizados en las cookies
    res.cookie("tickets", JSON.stringify(filteredTickets), { httpOnly: false });
    res.json({ message: "Ticket eliminado" });
});

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
