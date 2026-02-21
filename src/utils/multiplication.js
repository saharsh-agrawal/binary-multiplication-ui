/**
 * Binary Utilities
 */

/* global BigInt */

// Converts a number to a specific bit-length string
export const toBinary = (n, bits) => {
	if (n >= 0) {
		return n.toString(2).padStart(bits, "0").slice(-bits);
	} else {
		const mask = (1n << BigInt(bits)) - 1n;
		return (BigInt(n) & mask).toString(2).padStart(bits, "0");
	}
};

// Arithmetic Shift Right (preserves sign bit)
export const asr = (a, q, q_minus_1) => {
	const combined = a + q + (q_minus_1 !== null ? q_minus_1 : "");
	const shifted = combined[0] + combined.substring(0, combined.length - 1);
	return {
		newA: shifted.substring(0, a.length),
		newQ: shifted.substring(a.length, a.length + q.length),
		newQ_minus_1: q_minus_1 !== null ? shifted[shifted.length - 1] : null,
	};
};

// Logical Shift Right (fills with 0)
export const lsr = (a, q) => {
	const combined = a + q;
	const shifted = "0" + combined.substring(0, combined.length - 1);
	return {
		newA: shifted.substring(0, a.length),
		newQ: shifted.substring(a.length, a.length + q.length),
	};
};

// Binary Addition (Ignores Carry)
export const addBinary = (bin1, bin2, bits) => {
	const sum = BigInt("0b" + bin1) + BigInt("0b" + bin2);
	const mask = (1n << BigInt(bits)) - 1n;
	return (sum & mask).toString(2).padStart(bits, "0");
};

/**
 * ALGORITHMS
 */

export const runBooth = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let q_minus_1 = "0";
	let steps = [
		{ iteration: "Init", A, Q, q_minus_1, action: "Initialization" },
	];

	for (let i = 0; i < bits; i++) {
		let q0 = Q[Q.length - 1];
		let action =
			q0 === "1" && q_minus_1 === "0"
				? "A = A - M"
				: q0 === "0" && q_minus_1 === "1"
					? "A = A + M"
					: "No Op";

		if (q0 === "1" && q_minus_1 === "0") A = addBinary(A, negM, bits);
		if (q0 === "0" && q_minus_1 === "1") A = addBinary(A, M, bits);

		const shifted = asr(A, Q, q_minus_1);
		A = shifted.newA;
		Q = shifted.newQ;
		q_minus_1 = shifted.newQ_minus_1;
		steps.push({
			iteration: i + 1,
			A,
			Q,
			q_minus_1,
			action: `${action}, ASR`,
		});
	}
	return steps;
};

export const runSignedShiftAdd = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let steps = [{ iteration: "Init", A, Q, action: "Initialization" }];

	for (let i = 0; i < bits; i++) {
		let q0 = Q[Q.length - 1];
		let action = "No Add";
		if (q0 === "1") {
			if (i === bits - 1) {
				A = addBinary(A, negM, bits);
				action = "A = A - M (Sign)";
			} else {
				A = addBinary(A, M, bits);
				action = "A = A + M";
			}
		}
		const shifted = asr(A, Q, null);
		A = shifted.newA;
		Q = shifted.newQ;
		steps.push({ iteration: i + 1, A, Q, action: `${action}, ASR` });
	}
	return steps;
};

export const runUnsignedShiftAdd = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let steps = [{ iteration: "Init", A, Q, action: "Initialization" }];

	for (let i = 0; i < bits; i++) {
		let q0 = Q[Q.length - 1];
		let action = "No Add";
		let carry = "0";

		if (q0 === "1") {
			const sum = BigInt("0b" + A) + BigInt("0b" + M);
			const res = sum.toString(2).padStart(bits, "0");
			// For unsigned, we actually track the carry bit to shift it in
			if (res.length > bits) {
				carry = "1";
				A = res.slice(-bits);
			} else {
				A = res;
			}
			action = "A = A + M";
		}

		// Logical shift right including the carry from addition
		const combined = carry + A + Q;
		const shifted = "0" + combined.substring(0, combined.length - 1);
		A = shifted.substring(1, bits + 1);
		Q = shifted.substring(bits + 1);

		steps.push({ iteration: i + 1, A, Q, action: `${action}, LSR` });
	}
	return steps;
};
