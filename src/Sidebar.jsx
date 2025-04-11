import React from "react";

const Sidebar = ({ decks, onSelectDeck, selectedDeck, deckCounts }) => {
  return (
    <div className="bg-white shadow-md w-60 p-4 border-r h-screen">
      <h2 className="text-lg font-bold mb-4 text-blue-700">
        📁 Flashcard Decks
      </h2>
      <ul>
        {decks.map((deck) => (
          <li key={deck}>
            <button
              onClick={() => onSelectDeck(deck)}
              className={`w-full text-left p-2 rounded-md mb-2 hover:bg-blue-100 ${
                selectedDeck === deck ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {deck}({deckCounts[deck] || 0})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
