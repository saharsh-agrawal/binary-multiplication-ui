# 🧮 Binary Multiplier Simulator

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)](https://binary-multiplication-ui.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

An interactive, step-by-step educational simulator for computer architecture multiplication algorithms. Designed for CS/ECE students to visualize register changes in real-time.

**[Live Demo 🚀](https://binary-multiplication-ui.vercel.app/)**

## ✨ Features

- **Booth's Algorithm:** Full signed multiplication with $Q_{-1}$ tracking.
- **Modified Shift & Add:** Signed 2's complement multiplication using Robertson's logic.
- **Unsigned Shift & Add:** Standard binary magnitude multiplication.
- **Flexible Inputs:** Support for Decimal, Unsigned Binary, and 2's Complement inputs.
- **Arbitrary Bit Widths:** Test with 4-bit, 8-bit, 16-bit, 32-bit, or custom $n$-bit widths (powered by JS `BigInt`).
- **Format Cross-Validation:** Built-in safeguards to prevent format/algorithm mismatching.

## 🛠️ Tech Stack

- **Frontend:** React, Vite
- **Logic Engine:** Custom Vanilla JS BigInt implementation
- **Styling:** CSS-in-JS / Inline styling (zero external dependencies)
- **Hosting:** Vercel

## 🚀 Local Development

1. **Clone the repository:**
    ```bash
    git clone [https://github.com/saharsh-agrawal/binary-multiplication-ui.git](https://github.com/saharsh-agrawal/binary-multiplication-ui.git)
    cd binary-multiplication-ui
    ```
2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

## 🤝 Contributing

We welcome contributions! Whether it's adding Non-Restoring Division, Wallace Tree multipliers, or improving the UI, check out our Contributing Guidelines.

## 📝 License

This project is licensed under the MIT License.

---
