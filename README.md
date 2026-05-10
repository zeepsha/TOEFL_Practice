# 🎓 TOEFL RPG Practice (Open Source)

The Lexicon Chronicles is a premium, RPG-gamified TOEFL practice platform. Turn your study sessions into epic battles, level up your scholar, and conquer the Text Titans.

## 🎮 Key Features
- **RPG Mechanics**: HP, EXP, Leveling, and Streak systems.
- **Difficulty Tiers**: Choose between Easy, Medium, and Hard modes.
- **Premium UI**: Apple-inspired minimalist design with dark-gold accents.
- **Offline Ready**: No server required; runs directly from your local folder.

---

## 🛠 Contribution Guide (Adding New Questions)

We welcome contributions from the community! To add new questions or passages, please follow these steps:

### 1. Structure of Bank Soal
All data is stored in the `data/` folder as JavaScript files for compatibility.

#### Grammar & Vocabulary (`data/grammar_vocab.js`)
Add new objects to the `GRAMMAR_DATA` array:
```javascript
{
  "id": "GV101",
  "section": "Grammar",
  "question": "The candidate ________ the interview with great confidence.",
  "options": ["conducted", "conducting", "conduct", "has conduct"],
  "answer": "conducted"
}
```

#### Reading Comprehension (`data/reading.js`)
Add new passages to the `READING_DATA` array:
```javascript
{
  "id": "R11",
  "passage": "Full academic text here...",
  "questions": [
    {
      "id": "R11Q1",
      "question": "Question text...",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct Option"
    }
  ]
}
```

### 2. How to Submit
1. **Fork** the repository.
2. Create a new branch: `git checkout -b feature/add-new-questions`.
3. Add your questions to the corresponding `.js` files in the `data/` folder.
4. **Validate**: Open `index.html` in your browser to ensure your questions load correctly in the RPG arena.
5. **Commit & Push**: `git commit -m "Added 20 new Grammar questions"` and `git push origin branch-name`.
6. Open a **Pull Request**.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ⚔️ by **Imperium Digital**.
