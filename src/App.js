/* global BigInt */

import { useState } from "react";
import {
	runBooth,
	runSignedShiftAdd,
	runUnsignedShiftAdd,
} from "./utils/multiplication";

const App = () => {
	// config handles the "draft" state of the form
	const [config, setConfig] = useState({
		m: "18",
		q: "-46",
		bits: "8",
		format: "decimal",
		algo: "booth",
	});
	// data handles the "snapshot" of the last calculation
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

		// Save the configuration used for THIS specific run
		setData({
			steps,
			fullBin,
			resDec: resDec.toString(),
			expected: (mVal * qVal).toString(),
			snapshotAlgo: config.algo,
			snapshotBits: b,
		});
	};

	return (
		<div
			style={{
				maxWidth: "1000px",
				margin: "20px auto",
				fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
				padding: "0 15px",
				boxSizing: "border-box",
			}}
		>
			<h1
				style={{
					textAlign: "center",
					color: "#2c3e50",
					fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
					marginBottom: "30px",
				}}
			>
				Binary Multiplier Simulator
			</h1>

			{/* FORM SECTION - Responsive Grid */}
			<div
				style={{
					background: "#fff",
					padding: "clamp(15px, 4vw, 24px)",
					borderRadius: "12px",
					boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					gap: "20px",
					marginBottom: "30px",
				}}
			>
				<div className="form-group">
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
							fontSize: "0.9rem",
						}}
					>
						Input Format
					</label>
					<select
						style={{
							width: "100%",
							padding: "12px",
							borderRadius: "6px",
							border: "1px solid #ddd",
						}}
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
				<div className="form-group">
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
							fontSize: "0.9rem",
						}}
					>
						Algorithm
					</label>
					<select
						style={{
							width: "100%",
							padding: "12px",
							borderRadius: "6px",
							border: "1px solid #ddd",
						}}
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
				<div className="form-group">
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
							fontSize: "0.9rem",
						}}
					>
						Bit Size (n)
					</label>
					<input
						type="number"
						style={{
							width: "100%",
							padding: "12px",
							boxSizing: "border-box",
							borderRadius: "6px",
							border: "1px solid #ddd",
						}}
						value={config.bits}
						onChange={(e) =>
							setConfig({ ...config, bits: e.target.value })
						}
					/>
				</div>
				<div className="form-group">
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
							fontSize: "0.9rem",
						}}
					>
						Multiplicand (M)
					</label>
					<input
						style={{
							width: "100%",
							padding: "12px",
							boxSizing: "border-box",
							borderRadius: "6px",
							border: "1px solid #ddd",
						}}
						value={config.m}
						onChange={(e) =>
							setConfig({ ...config, m: e.target.value })
						}
					/>
				</div>
				<div className="form-group">
					<label
						style={{
							display: "block",
							fontWeight: "bold",
							marginBottom: "8px",
							fontSize: "0.9rem",
						}}
					>
						Multiplier (Q)
					</label>
					<input
						style={{
							width: "100%",
							padding: "12px",
							boxSizing: "border-box",
							borderRadius: "6px",
							border: "1px solid #ddd",
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
							padding: "14px",
							background: "#3498db",
							color: "#fff",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
							fontWeight: "bold",
							transition: "background 0.2s",
						}}
					>
						Run Simulation
					</button>
				</div>
			</div>

			{error && (
				<div
					style={{
						background: "#fee2e2",
						color: "#b91c1c",
						padding: "15px",
						borderRadius: "6px",
						marginBottom: "20px",
						border: "1px solid #fecaca",
					}}
				>
					{error}
				</div>
			)}

			{data && (
				<div style={{ animation: "fadeIn 0.5s ease-in" }}>
					<h2
						style={{
							color: "#7f8c8d",
							fontSize: "1.1rem",
							marginBottom: "10px",
						}}
					>
						Step-by-Step:{" "}
						{data.snapshotAlgo.replace("_", " ").toUpperCase()} (
						{data.snapshotBits} bits)
					</h2>

					{/* Table Container for Horizontal Scrolling on Mobile */}
					<div
						style={{
							overflowX: "auto",
							background: "#fff",
							borderRadius: "12px",
							boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
							WebkitOverflowScrolling: "touch",
						}}
					>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								minWidth: "600px",
							}}
						>
							<thead
								style={{ background: "#2c3e50", color: "#fff" }}
							>
								<tr>
									<th
										style={{
											padding: "15px",
											textAlign: "center",
										}}
									>
										Iter
									</th>
									<th
										style={{
											padding: "15px",
											textAlign: "left",
										}}
									>
										Action
									</th>
									<th
										style={{
											padding: "15px",
											textAlign: "left",
										}}
									>
										Accumulator (A)
									</th>
									<th
										style={{
											padding: "15px",
											textAlign: "left",
										}}
									>
										Multiplier (Q)
									</th>
									{data.snapshotAlgo === "booth" && (
										<th
											style={{
												padding: "15px",
												textAlign: "center",
											}}
										>
											Q₋₁
										</th>
									)}
								</tr>
							</thead>
							<tbody>
								{data.steps.map((s, i) => (
									<tr
										key={i}
										style={{
											borderBottom: "1px solid #edf2f7",
											background: s.action.includes(
												"Shift",
											)
												? "#f8fafc"
												: "#fff",
										}}
									>
										<td
											style={{
												padding: "12px",
												textAlign: "center",
												color: "#718096",
											}}
										>
											{s.iter}
										</td>
										<td
											style={{
												padding: "12px",
												fontWeight: s.action.includes(
													"=",
												)
													? "bold"
													: "normal",
												color: s.action.includes("=")
													? "#d97706"
													: "#2d3748",
											}}
										>
											{s.action}
										</td>
										<td
											style={{
												padding: "12px",
												fontFamily:
													'"Courier New", Courier, monospace',
												fontWeight: "600",
											}}
										>
											{s.A}
										</td>
										<td
											style={{
												padding: "12px",
												fontFamily:
													'"Courier New", Courier, monospace',
												fontWeight: "600",
											}}
										>
											{s.Q}
										</td>
										{data.snapshotAlgo === "booth" && (
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
					</div>

					{/* ANALYSIS CARD - Responsive Flex/Grid */}
					<div
						style={{
							marginTop: "30px",
							padding: "24px",
							background:
								data.resDec === data.expected
									? "#f0fdf4"
									: "#fef2f2",
							borderRadius: "12px",
							border: "1px solid",
							borderColor:
								data.resDec === data.expected
									? "#bbf7d0"
									: "#fecaca",
						}}
					>
						<h3 style={{ marginTop: 0, color: "#1f2937" }}>
							Validation Results
						</h3>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "space-between",
								gap: "20px",
							}}
						>
							<div style={{ flex: "1 1 300px" }}>
								<p style={{ margin: "8px 0" }}>
									<strong>Final Binary Product (AQ):</strong>
								</p>
								<p
									style={{
										fontFamily: "monospace",
										fontSize: "1.2rem",
										wordBreak: "break-all",
										color: "#4a5568",
									}}
								>
									{data.fullBin}
								</p>
								<p style={{ margin: "8px 0" }}>
									<strong>Decimal Conversion:</strong>{" "}
									<span
										style={{
											fontSize: "1.2rem",
											fontWeight: "bold",
										}}
									>
										{data.resDec}
									</span>
								</p>
							</div>
							<div
								style={{
									flex: "1 1 200px",
									textAlign:
										window.innerWidth > 600
											? "right"
											: "left",
								}}
							>
								<p style={{ margin: "8px 0" }}>
									<strong>Theoretical (M × Q):</strong>
								</p>
								<p
									style={{
										fontSize: "1.2rem",
										color: "#4a5568",
									}}
								>
									{data.expected}
								</p>
								<p
									style={{
										fontSize: "1.3rem",
										fontWeight: "900",
										color:
											data.resDec === data.expected
												? "#16a34a"
												: "#dc2626",
										marginTop: "15px",
									}}
								>
									{data.resDec === data.expected
										? "✓ VERIFIED"
										: "✗ ERROR"}
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
