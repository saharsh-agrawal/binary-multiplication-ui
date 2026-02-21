import { useState } from "react";
import { runBooth, runSignedShiftAdd } from "./utils/multiplication";

const App = () => {
	const [mInput, setMInput] = useState("18");
	const [qInput, setQInput] = useState("-46");
	const [bits, setBits] = useState(8);
	const [algo, setAlgo] = useState("booth");
	const [results, setResults] = useState(null);

	const calculate = () => {
		const m = parseInt(mInput);
		const q = parseInt(qInput);
		const steps =
			algo === "booth"
				? runBooth(m, q, bits)
				: runSignedShiftAdd(m, q, bits);

		const finalBin = steps[steps.length - 1].A + steps[steps.length - 1].Q;
		let decimalRes = parseInt(finalBin, 2);
		if (finalBin[0] === "1") {
			decimalRes -= Math.pow(2, bits * 2);
		}

		setResults({ steps, finalBin, decimalRes, expected: m * q });
	};

	return (
		<div style={{ padding: "20px", fontFamily: "sans-serif" }}>
			<h2>Computer Architecture Multiplier</h2>

			<div
				style={{
					display: "flex",
					gap: "10px",
					marginBottom: "20px",
					flexWrap: "wrap",
				}}
			>
				<input
					type="number"
					placeholder="Multiplicand (M)"
					value={mInput}
					onChange={(e) => setMInput(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Multiplier (Q)"
					value={qInput}
					onChange={(e) => setQInput(e.target.value)}
				/>
				<select
					value={bits}
					onChange={(e) => setBits(parseInt(e.target.value))}
				>
					{[4, 8, 16].map((b) => (
						<option key={b} value={b}>
							{b} Bits
						</option>
					))}
				</select>
				<select value={algo} onChange={(e) => setAlgo(e.target.value)}>
					<option value="booth">Booth's Algorithm</option>
					<option value="signedShiftAdd">Signed Shift & Add</option>
				</select>
				<button
					onClick={calculate}
					style={{ padding: "5px 15px", cursor: "pointer" }}
				>
					Calculate
				</button>
			</div>

			{results && (
				<div>
					<table
						border="1"
						cellPadding="10"
						style={{ borderCollapse: "collapse", width: "100%" }}
					>
						<thead>
							<tr style={{ background: "#f0f0f0" }}>
								<th>Step</th>
								<th>Action</th>
								<th>Accumulator (A)</th>
								<th>Multiplier (Q)</th>
								{algo === "booth" && <th>Q_{-1}</th>}
							</tr>
						</thead>
						<tbody>
							{results.steps.map((s, i) => (
								<tr key={i}>
									<td>{s.iteration}</td>
									<td>{s.action}</td>
									<td style={{ fontFamily: "monospace" }}>
										{s.A}
									</td>
									<td style={{ fontFamily: "monospace" }}>
										{s.Q}
									</td>
									{algo === "booth" && (
										<td style={{ fontFamily: "monospace" }}>
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
							background: "#eef",
						}}
					>
						<p>
							<strong>Binary Result:</strong> {results.finalBin}
						</p>
						<p>
							<strong>Calculated Decimal:</strong>{" "}
							{results.decimalRes}
						</p>
						<p>
							<strong>Expected (M × Q):</strong>{" "}
							{results.expected}
						</p>
						<p
							style={{
								color:
									results.decimalRes === results.expected
										? "green"
										: "red",
							}}
						>
							{results.decimalRes === results.expected
								? "✓ Calculation Validated"
								: "✗ Validation Failed"}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
