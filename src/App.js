/* global BigInt */

import { useState } from "react";
import {
	runBooth,
	runSignedShiftAdd,
	runUnsignedShiftAdd,
} from "./utils/multiplication";

const App = () => {
	const [inputs, setInputs] = useState({
		m: "18",
		q: "-46",
		bits: 8,
		format: "decimal",
		algo: "booth",
	});
	const [results, setResults] = useState(null);
	const [error, setError] = useState("");

	const parseInput = (val, format, bits) => {
		if (format === "decimal") return parseInt(val);
		if (format === "unsigned") return parseInt(val, 2);
		if (format === "2s_complement") {
			let res = parseInt(val, 2);
			if (val[0] === "1" && val.length === bits) res -= Math.pow(2, bits);
			return res;
		}
		return 0;
	};

	const validate = () => {
		const { m, q, bits, format, algo } = inputs;
		if (!m || !q) return "Please enter both numbers.";

		// Check for unsigned constraints
		if (algo === "unsigned" || format === "unsigned") {
			if (parseInt(m) < 0 || parseInt(q) < 0)
				return "Unsigned mode does not support negative numbers.";
		}

		// Check bit length for binary inputs
		if (format !== "decimal") {
			if (m.length > bits || q.length > bits)
				return `Inputs exceed ${bits} bits.`;
			if (!/^[01]+$/.test(m) || !/^[01]+$/.test(q))
				return "Binary formats must only contain 0 and 1.";
		} else {
			// Check if decimal fits in bits
			const maxSigned = Math.pow(2, bits - 1) - 1;
			const minSigned = -Math.pow(2, bits - 1);
			const mNum = parseInt(m);
			const qNum = parseInt(q);
			if (
				algo !== "unsigned" &&
				(mNum > maxSigned ||
					mNum < minSigned ||
					qNum > maxSigned ||
					qNum < minSigned)
			) {
				return `Decimal values exceed range for signed ${bits}-bit (${minSigned} to ${maxSigned}).`;
			}
		}
		return null;
	};

	const handleCalculate = () => {
		const err = validate();
		if (err) {
			setError(err);
			setResults(null);
			return;
		}
		setError("");

		const mVal = parseInput(inputs.m, inputs.format, inputs.bits);
		const qVal = parseInput(inputs.q, inputs.format, inputs.bits);

		let steps;
		if (inputs.algo === "booth") steps = runBooth(mVal, qVal, inputs.bits);
		else if (inputs.algo === "signed_shift")
			steps = runSignedShiftAdd(mVal, qVal, inputs.bits);
		else steps = runUnsignedShiftAdd(mVal, qVal, inputs.bits);

		const lastStep = steps[steps.length - 1];
		const finalBin = lastStep.A + lastStep.Q;
		let decimalRes = BigInt("0b" + finalBin);
		if (inputs.algo !== "unsigned" && finalBin[0] === "1") {
			decimalRes -= BigInt(2) ** BigInt(inputs.bits * 2);
		}

		setResults({
			steps,
			finalBin,
			decimalRes: decimalRes.toString(),
			expected: (BigInt(mVal) * BigInt(qVal)).toString(),
		});
	};

	return (
		<div
			style={{
				maxWidth: "900px",
				margin: "auto",
				padding: "20px",
				fontFamily: "system-ui",
			}}
		>
			<h1>Advanced Binary Multiplier</h1>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gap: "15px",
					marginBottom: "20px",
					padding: "15px",
					background: "#f9f9f9",
					borderRadius: "8px",
				}}
			>
				<div>
					<label>Format</label>
					<select
						style={{ width: "100%" }}
						onChange={(e) =>
							setInputs({ ...inputs, format: e.target.value })
						}
					>
						<option value="decimal">Decimal</option>
						<option value="unsigned">Unsigned Binary</option>
						<option value="2s_complement">
							2's Complement Binary
						</option>
					</select>
				</div>
				<div>
					<label>Algorithm</label>
					<select
						style={{ width: "100%" }}
						onChange={(e) =>
							setInputs({ ...inputs, algo: e.target.value })
						}
					>
						<option value="booth">
							Booth's Algorithm (Signed)
						</option>
						<option value="signed_shift">Signed Shift & Add</option>
						<option value="unsigned">Unsigned Shift & Add</option>
					</select>
				</div>
				<div>
					<label>Bit Size</label>
					<select
						style={{ width: "100%" }}
						value={inputs.bits}
						onChange={(e) =>
							setInputs({
								...inputs,
								bits: parseInt(e.target.value),
							})
						}
					>
						{[4, 8, 16, 32].map((b) => (
							<option key={b} value={b}>
								{b} Bits
							</option>
						))}
					</select>
				</div>
				<input
					placeholder="Multiplicand (M)"
					value={inputs.m}
					onChange={(e) =>
						setInputs({ ...inputs, m: e.target.value })
					}
				/>
				<input
					placeholder="Multiplier (Q)"
					value={inputs.q}
					onChange={(e) =>
						setInputs({ ...inputs, q: e.target.value })
					}
				/>
				<button
					onClick={handleCalculate}
					style={{
						background: "#007bff",
						color: "white",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
					}}
				>
					Generate Steps
				</button>
			</div>

			{error && (
				<div style={{ color: "red", marginBottom: "10px" }}>
					{error}
				</div>
			)}

			{results && (
				<>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							textAlign: "left",
						}}
						border="1"
					>
						<thead style={{ background: "#eee" }}>
							<tr>
								<th>Iter</th>
								<th>Action</th>
								<th>Accumulator (A)</th>
								<th>Multiplier (Q)</th>
								{inputs.algo === "booth" && <th>Q₋₁</th>}
							</tr>
						</thead>
						<tbody>
							{results.steps.map((s, i) => (
								<tr key={i}>
									<td style={{ padding: "8px" }}>
										{s.iteration}
									</td>
									<td style={{ padding: "8px" }}>
										{s.action}
									</td>
									<td
										style={{
											fontFamily: "monospace",
											padding: "8px",
										}}
									>
										{s.A}
									</td>
									<td
										style={{
											fontFamily: "monospace",
											padding: "8px",
										}}
									>
										{s.Q}
									</td>
									{inputs.algo === "booth" && (
										<td
											style={{
												fontFamily: "monospace",
												padding: "8px",
											}}
										>
											{s.q_minus_1}
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>

					<div
						style={{
							marginTop: "20px",
							padding: "15px",
							backgroundColor:
								results.decimalRes === results.expected
									? "#e6ffed"
									: "#ffeef0",
							borderRadius: "8px",
						}}
					>
						<h3>Final Results</h3>
						<p>
							<strong>Binary:</strong> {results.finalBin}
						</p>
						<p>
							<strong>Decimal:</strong> {results.decimalRes}
						</p>
						<p>
							<strong>Verification:</strong>{" "}
							{results.decimalRes === results.expected
								? "✅ Matches M × Q"
								: "❌ Discrepancy Found"}
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default App;
