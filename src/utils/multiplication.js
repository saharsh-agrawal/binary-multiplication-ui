/**
 * Utility functions for 2's complement and binary math
 */

/* global BigInt */

export const toBinary = (n, bits) => {
	if (n >= 0) {
		return n.toString(2).padStart(bits, "0").slice(-bits);
	} else {
		// 2's complement for negative numbers
		const positiveBin = Math.abs(n).toString(2).padStart(bits, "0");
		let inverted = positiveBin
			.split("")
			.map((bit) => (bit === "0" ? "1" : "0"))
			.join("");
		let val = BigInt("0b" + inverted) + 1n;
		return val.toString(2).padStart(bits, "0").slice(-bits);
	}
};

export const arithmeticShiftRight = (a, q, q_minus_1) => {
	const combined = a + q + (q_minus_1 ?? "");
	const shifted = combined[0] + combined.substring(0, combined.length - 1);

	const newA = shifted.substring(0, a.length);
	const newQ = shifted.substring(a.length, a.length + q.length);
	const newQ_minus_1 =
		q_minus_1 !== null ? shifted[shifted.length - 1] : null;

	return { newA, newQ, newQ_minus_1 };
};

export const addBinary = (bin1, bin2, bits) => {
	const sum = BigInt("0b" + bin1) + BigInt("0b" + bin2);
	const mask = (1n << BigInt(bits)) - 1n;
	return (sum & mask).toString(2).padStart(bits, "0");
};

export const runBooth = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let q_minus_1 = "0";
	let steps = [{ iteration: "Init", A, Q, q_minus_1, action: "Initial" }];

	for (let i = 0; i < bits; i++) {
		let q0 = Q[Q.length - 1];
		let action = "";

		if (q0 === "1" && q_minus_1 === "0") {
			A = addBinary(A, negM, bits);
			action = "A = A - M";
		} else if (q0 === "0" && q_minus_1 === "1") {
			A = addBinary(A, M, bits);
			action = "A = A + M";
		} else {
			action = "No Op";
		}

		const shifted = arithmeticShiftRight(A, Q, q_minus_1);
		A = shifted.newA;
		Q = shifted.newQ;
		q_minus_1 = shifted.newQ_minus_1;

		steps.push({
			iteration: i + 1,
			A,
			Q,
			q_minus_1,
			action: `${action}, Shift`,
		});
	}
	return steps;
};

export const runSignedShiftAdd = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let steps = [{ iteration: "Init", A, Q, action: "Initial" }];

	for (let i = 0; i < bits; i++) {
		let q0 = Q[Q.length - 1];
		let action = "No Add";

		if (q0 === "1") {
			if (i === bits - 1) {
				A = addBinary(A, negM, bits);
				action = "A = A - M (Sign Bit)";
			} else {
				A = addBinary(A, M, bits);
				action = "A = A + M";
			}
		}

		const shifted = arithmeticShiftRight(A, Q, null);
		A = shifted.newA;
		Q = shifted.newQ;

		steps.push({ iteration: i + 1, A, Q, action: `${action}, Shift` });
	}
	return steps;
};
