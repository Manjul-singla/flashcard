import React, { useState, useEffect } from "react";
import { defaultFlashcards } from "./defaultcards";
import Sidebar from "./Sidebar";

const delayMap = {
  easy: 10 * 60 * 1000,
  medium: 5 * 60 * 1000,
  hard: 2 * 60 * 1000,
  veryHard: 1 * 60 * 1000,
};

const resetFlashcards = () => {
  const cleanedCards = defaultFlashcards.map((card) => ({
    ...card,
    nextReview: 0,
  }));
  localStorage.setItem("flashcards", JSON.stringify(cleanedCards));
  window.location.reload();
};

export default function App() {
  const [cards, setCards] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [time, setTime] = useState(0);
  const [selectedDeck, setSelectedDeck] = useState("All");
  const [showSidebar, setShowSidebar] = useState(false); // For mobile toggle

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("flashcards")) ||
      defaultFlashcards.map((card) => ({
        ...card,
        nextReview: 0,
      }));
    setCards(saved);
  }, []);

  useEffect(() => {
    let available = cards.filter((card) => Date.now() >= card.nextReview);

    if (selectedDeck !== "All") {
      available = available.filter(
        (card) =>
          card.lastDifficulty &&
          card.lastDifficulty.toLowerCase().replace(/\s/g, "") ===
            selectedDeck.toLowerCase().replace(/\s/g, "")
      );
    }

    setQueue(available);
    setCurrentCard(available[0] || null);
  }, [cards, selectedDeck]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deckCounts = cards.reduce((acc, card) => {
    const key = card.lastDifficulty
      ? card.lastDifficulty === "veryHard"
        ? "Very Hard"
        : card.lastDifficulty.charAt(0).toUpperCase() +
          card.lastDifficulty.slice(1)
      : "Unsorted";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  deckCounts["All"] = cards.length;

  const handleReview = (difficulty) => {
    const updatedCards = cards.map((card) => {
      if (card.english === currentCard.english) {
        return {
          ...card,
          nextReview: Date.now() + delayMap[difficulty],
          lastDifficulty: difficulty,
        };
      }
      return card;
    });

    const newQueue = queue.slice(1);
    setCards(updatedCards);
    localStorage.setItem("flashcards", JSON.stringify(updatedCards));
    setReviewedCount((prev) => prev + 1);
    setQueue(newQueue);
    setCurrentCard(newQueue[0] || null);
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    setShowSidebar(false); // Hide sidebar after selecting in mobile
  };

  return (
    <div className="flex">
      {/* Hamburger icon (mobile) */}
      {/* Hamburger button (visible only on small screens) */}
      <button
        className="md:hidden p-4 absolute top-2 right-2 z-50"
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        <span className="text-2xl">☰</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 bg-white shadow-lg transition-transform transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:block`}
      >
        <Sidebar
          decks={[
            "All",
            ...new Set(
              cards
                .map((card) => card.lastDifficulty)
                .filter(Boolean)
                .map((diff) =>
                  diff === "veryHard"
                    ? "Very Hard"
                    : diff.charAt(0).toUpperCase() + diff.slice(1)
                )
            ),
          ]}
          onSelectDeck={handleDeckSelect}
          selectedDeck={selectedDeck}
          deckCounts={deckCounts}
        />
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center w-full p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          📚 Hindi Flashcards
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          {currentCard ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {currentCard.english}
              </h2>
              <p className="text-lg text-gray-600">{currentCard.hindi}</p>
              <p className="text-lg text-gray-600 mb-4">
                {currentCard.hinglish}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => handleReview("easy")}
                  className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded"
                >
                  Easy
                </button>
                <button
                  onClick={() => handleReview("medium")}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleReview("hard")}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded"
                >
                  Hard
                </button>
                <button
                  onClick={() => handleReview("veryHard")}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                >
                  Very Hard
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-600">🎉 All cards reviewed!</p>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Time Spent: {formatTime(time)} | Reviewed: {reviewedCount}
        </p>

        <button
          className="mt-2 text-sm text-red-600 hover:underline"
          onClick={resetFlashcards}
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
}
