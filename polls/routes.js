const express = require("express");
const router = express.Router();
const services = require("./services");
const { getDB } = require("../db/mongodb");
const { createPollSchema } = require("./schemas");

router.get("/", async (req, res) => {
  const polls = await services.getAllPolls();
  res.status(200).json(polls);
});

//tarefa 1

router.get("/:id", async (req, res) => {
  const pollId = req.params.id;

  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "not found" });
  }

  res.status(200).json(poll);
});

//tarefa 2
router.post("/", async (req, res) => {
  const { error, value } = schemas.createPollSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }
  const createPoll = await services.createPoll(value);
  res.status(201).json(createPoll);
});

//tarefa 3

router.put("/:id/vote", async (req, res) => {
  const pollId = req.params.id;
  const option = req.body.option;

  const { error, value } = schemas.voteSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    return res.status(400).json({ error: "expired poll" });
  }

  const uptadeResult = await services.vote(pollId, option);
  if (!uptadeResult) {
    return res.status(500).json({ error: "failed to vote" });
  }
  res.status(200).json({ message: "voted!" });
});

router.delete("/:id", async (req, res) => {
  const pollId = req.params.id;

  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }

  const deleted = await services.deletePollById(pollId);
  if (!deleted) {
    return res.status(500).json({ error: "failed to delete poll" });
  }

  res.status(200).json({ message: "poll deleted successfully" });
});

module.exports = router;
