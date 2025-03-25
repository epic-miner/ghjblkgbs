import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";

const API_URL = "https://polished-river-de65.ahf626085.workers.dev/api";
const API_KEY = "7291826614";

export async function registerRoutes(app: Express): Promise<Server> {
  // API proxy routes to handle requests to the anime API
  app.get("/api/anime", async (req, res) => {
    try {
      const response = await axios.get(`${API_URL}/anime`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching anime list:", error);
      res.status(500).json({ error: "Failed to fetch anime list" });
    }
  });

  app.get("/api/anime/:id", async (req, res) => {
    try {
      const response = await axios.get(`${API_URL}/anime/${req.params.id}`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ error: "Failed to fetch anime details" });
    }
  });

  app.get("/api/episodes", async (req, res) => {
    try {
      const animeId = req.query.anime_id;
      const url = animeId 
        ? `${API_URL}/episodes?anime_id=${animeId}` 
        : `${API_URL}/episodes`;
      
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const response = await axios.get(`${API_URL}/episodes/${req.params.id}`);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching episode details:", error);
      res.status(500).json({ error: "Failed to fetch episode details" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      const type = req.query.type || 'all';
      const genre = req.query.genre;
      
      let url = `${API_URL}/search?`;
      
      if (query) {
        url += `q=${encodeURIComponent(String(query))}&`;
      }
      
      if (type) {
        url += `type=${encodeURIComponent(String(type))}&`;
      }
      
      if (genre) {
        url += `genre=${encodeURIComponent(String(genre))}&`;
      }
      
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
