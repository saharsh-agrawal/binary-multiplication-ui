/* global BigInt */

import { useState } from "react";
import {
	runBooth,
	runSignedShiftAdd,
	runUnsignedShiftAdd,
} from "./utils/multiplication";

const App = () => {
	const [config, setConfig] = useState({
		m: "18",
		q: "-46",
		bits: "8",
		format: "decimal",
		algo: "booth",
	});
	const [data, setData] = useState(null);
	const [error, setError] = useState("");

	const validate = () => {
		const { m, q, bits, format, algo } = config;
		const b = parseInt(bits);
		if (!m || !q || isNaN(b) || b <= 0)
			return "Please provide valid M, Q, and Bit Size.";

		if (format === "decimal") {
			const mVal = BigInt(m),
				qVal = BigInt(q);
			const limit =
				algo === "unsigned"
					? 2n ** BigInt(b) - 1n
					: 2n ** BigInt(b - 1) - 1n;
			const min = algo === "unsigned" ? 0n : -(2n ** BigInt(b - 1));
			if (mVal > limit || mVal < min || qVal > limit || qVal < min)
				return `Values exceed range for ${b}-bit ${algo === "unsigned" ? "Unsigned" : "Signed"} format.`;
		} else {
			if (!/^[01]+$/.test(m) || !/^[01]+$/.test(q))
				return "Binary inputs must only contain 0 and 1.";
			if (m.length > b || q.length > b)
				return `Binary string length exceeds ${b} bits.`;
		}
		return null;
	};

	const calculate = () => {
		const err = validate();
		if (err) {
			setError(err);
			setData(null);
			return;
		}
		setError("");

		const b = parseInt(config.bits);
		const parse = (v) =>
			config.format === "decimal"
				? BigInt(v)
				: config.format === "unsigned" || v[0] === "0" || v.length < b
					? BigInt("0b" + v)
					: BigInt("0b" + v) - (1n << BigInt(b));

		const mVal = parse(config.m),
			qVal = parse(config.q);
		let steps =
			config.algo === "booth"
				? runBooth(mVal, qVal, b)
				: config.algo === "signed_shift"
					? runSignedShiftAdd(mVal, qVal, b)
					: runUnsignedShiftAdd(mVal, qVal, b);

		const last = steps[steps.length - 1];
		const fullBin = last.A + last.Q;
		let resDec = BigInt("0b" + fullBin);
		if (config.algo !== "unsigned" && fullBin[0] === "1")
			resDec -= 1n << BigInt(b * 2);

		setData({
			steps,
			fullBin,
			resDec: resDec.toString(),
			expected: (mVal * qVal).toString(),
		});
	};

	return (
		<div
			style={{
				maxWidth: "1000px",
				margin: "40px auto",
				fontFamily: "Segoe UI, sans-serif",
				padding: "0 20px",
			}}
		>
			<h1 style={{ textAlign: "center", color: "#2c3e50" }}>
				Binary Multiplier Simulator
			</h1>

			<div
				style={{
					background: "#fff",
					padding: "24px",
					borderRadius: "12px",
					boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "20px",
					marginBottom: "30px",
				}}
			>
				<div>
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						Input Format
					</label>
					<select
						style={{ width: "100%", padding: "10px" }}
						value={config.format}
						onChange={(e) =>
							setConfig({ ...config, format: e.target.value })
						}
					>
						<option value="decimal">Decimal (Base 10)</option>
						<option value="unsigned">Unsigned Binary</option>
						<option value="2s_complement">
							2's Complement Binary
						</option>
					</select>
				</div>
				<div>
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						Algorithm
					</label>
					<select
						style={{ width: "100%", padding: "10px" }}
						value={config.algo}
						onChange={(e) =>
							setConfig({ ...config, algo: e.target.value })
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
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						Bit Size (n)
					</label>
					<input
						type="number"
						style={{
							width: "100%",
							padding: "10px",
							boxSizing: "border-box",
						}}
						value={config.bits}
						onChange={(e) =>
							setConfig({ ...config, bits: e.target.value })
						}
					/>
				</div>
				<div>
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						Multiplicand (M)
					</label>
					<input
						style={{
							width: "100%",
							padding: "10px",
							boxSizing: "border-box",
						}}
						value={config.m}
						onChange={(e) =>
							setConfig({ ...config, m: e.target.value })
						}
					/>
				</div>
				<div>
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
						}}
					>
						Multiplier (Q)
					</label>
					<input
						style={{
							width: "100%",
							padding: "10px",
							boxSizing: "border-box",
						}}
						value={config.q}
						onChange={(e) =>
							setConfig({ ...config, q: e.target.value })
						}
					/>
				</div>
				<div style={{ display: "flex", alignItems: "flex-end" }}>
					<button
						onClick={calculate}
						style={{
							width: "100%",
							padding: "12px",
							background: "#3498db",
							color: "#fff",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							fontWeight: "bold",
						}}
					>
						Run Simulation
					</button>
				</div>
			</div>

			{error && (
				<div
					style={{
						background: "#f8d7da",
						color: "#721c24",
						padding: "15px",
						borderRadius: "6px",
						marginBottom: "20px",
					}}
				>
					{error}
				</div>
			)}

			{data && (
				<div style={{ overflowX: "auto" }}>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							background: "#fff",
							borderRadius: "8px",
							overflow: "hidden",
							boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
						}}
					>
						<thead style={{ background: "#34495e", color: "#fff" }}>
							<tr>
								<th style={{ padding: "12px" }}>Iter</th>
								<th style={{ padding: "12px" }}>Step/Action</th>
								<th style={{ padding: "12px" }}>
									Accumulator (A)
								</th>
								<th style={{ padding: "12px" }}>
									Multiplier (Q)
								</th>
								{config.algo === "booth" && (
									<th style={{ padding: "12px" }}>Q₋₁</th>
								)}
							</tr>
						</thead>
						<tbody>
							{data.steps.map((s, i) => (
								<tr
									key={i}
									style={{
										borderBottom: "1px solid #eee",
										background: s.action.includes("Shift")
											? "#fcfcfc"
											: "#fff",
									}}
								>
									<td
										style={{
											padding: "12px",
											textAlign: "center",
										}}
									>
										{s.iter}
									</td>
									<td
										style={{
											padding: "12px",
											fontWeight: s.action.includes("=")
												? "bold"
												: "normal",
											color: s.action.includes("=")
												? "#e67e22"
												: "#2c3e50",
										}}
									>
										{s.action}
									</td>
									<td
										style={{
											padding: "12px",
											fontFamily: "monospace",
											fontSize: "1.1em",
											letterSpacing: "1px",
										}}
									>
										{s.A}
									</td>
									<td
										style={{
											padding: "12px",
											fontFamily: "monospace",
											fontSize: "1.1em",
											letterSpacing: "1px",
										}}
									>
										{s.Q}
									</td>
									{config.algo === "booth" && (
										<td
											style={{
												padding: "12px",
												textAlign: "center",
												fontFamily: "monospace",
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
							marginTop: "30px",
							padding: "24px",
							background:
								data.resDec === data.expected
									? "#d4edda"
									: "#f8d7da",
							borderRadius: "12px",
							border: "1px solid",
						}}
					>
						<h3 style={{ marginTop: 0 }}>Result Analysis</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "20px",
							}}
						>
							<div>
								<p>
									<strong>Final Binary (AQ):</strong>{" "}
									<span style={{ fontFamily: "monospace" }}>
										{data.fullBin}
									</span>
								</p>
								<p>
									<strong>Calculated Decimal:</strong>{" "}
									{data.resDec}
								</p>
							</div>
							<div style={{ textAlign: "right" }}>
								<p>
									<strong>Actual M × Q:</strong>{" "}
									{data.expected}
								</p>
								<p
									style={{
										fontSize: "1.2em",
										fontWeight: "bold",
										color:
											data.resDec === data.expected
												? "#155724"
												: "#721c24",
									}}
								>
									{data.resDec === data.expected
										? "✅ MATCHED"
										: "❌ CALCULATION ERROR"}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
