/** Logic Engine with Sub-step Support
 */

/* global BigInt */

export const toBinary = (n, bits) => {
	const bigN = BigInt(n);
	const mask = (1n << BigInt(bits)) - 1n;
	return (bigN & mask).toString(2).padStart(bits, "0");
};

const addBinary = (bin1, bin2, bits) => {
	const sum = BigInt("0b" + bin1) + BigInt("0b" + bin2);
	const mask = (1n << BigInt(bits)) - 1n;
	return (sum & mask).toString(2).padStart(bits, "0");
};

// Arithmetic Shift Right
const asr = (a, q, q_minus_1) => {
	const combined = a + q + (q_minus_1 ?? "");
	const shifted = combined[0] + combined.substring(0, combined.length - 1);
	return {
		newA: shifted.substring(0, a.length),
		newQ: shifted.substring(a.length, a.length + q.length),
		newQ_minus_1: q_minus_1 !== null ? shifted[shifted.length - 1] : null,
	};
};

// Logical Shift Right
const lsr = (a, q, carry = "0") => {
	const combined = carry + a + q;
	const shifted = "0" + combined.substring(0, combined.length - 1);
	return {
		newA: shifted.substring(1, a.length + 1),
		newQ: shifted.substring(a.length + 1),
	};
};

export const runBooth = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let q_minus_1 = "0";
	let steps = [{ iter: 0, action: "Initial", A, Q, q_minus_1 }];

	for (let i = 1; i <= bits; i++) {
		let q0 = Q[Q.length - 1];

		if (q0 === "1" && q_minus_1 === "0") {
			A = addBinary(A, negM, bits);
			steps.push({ iter: i, action: "A = A - M", A, Q, q_minus_1 });
		} else if (q0 === "0" && q_minus_1 === "1") {
			A = addBinary(A, M, bits);
			steps.push({ iter: i, action: "A = A + M", A, Q, q_minus_1 });
		}

		const s = asr(A, Q, q_minus_1);
		A = s.newA;
		Q = s.newQ;
		q_minus_1 = s.newQ_minus_1;
		steps.push({ iter: i, action: "Shift Right (ASR)", A, Q, q_minus_1 });
	}
	return steps;
};

export const runSignedShiftAdd = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let negM = toBinary(-mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let steps = [{ iter: 0, action: "Initial", A, Q }];

	for (let i = 1; i <= bits; i++) {
		let q0 = Q[Q.length - 1];
		if (q0 === "1") {
			const isLast = i === bits;
			A = addBinary(A, isLast ? negM : M, bits);
			steps.push({
				iter: i,
				action: isLast ? "A = A - M (Sign)" : "A = A + M",
				A,
				Q,
			});
		}
		const s = asr(A, Q, null);
		A = s.newA;
		Q = s.newQ;
		steps.push({ iter: i, action: "Shift Right (ASR)", A, Q });
	}
	return steps;
};

export const runUnsignedShiftAdd = (mVal, qVal, bits) => {
	let M = toBinary(mVal, bits);
	let Q = toBinary(qVal, bits);
	let A = "0".repeat(bits);
	let steps = [{ iter: 0, action: "Initial", A, Q }];

	for (let i = 1; i <= bits; i++) {
		let q0 = Q[Q.length - 1];
		let carry = "0";
		if (q0 === "1") {
			const sum = BigInt("0b" + A) + BigInt("0b" + M);
			const res = sum.toString(2);
			if (res.length > bits) carry = "1";
			A = res.padStart(bits, "0").slice(-bits);
			steps.push({ iter: i, action: "A = A + M", A, Q, carry });
		}
		const prevCarry = steps[steps.length - 1].carry || "0";
		const s = lsr(A, Q, prevCarry);
		A = s.newA;
		Q = s.newQ;
		steps.push({ iter: i, action: "Shift Right (LSR)", A, Q });
	}
	return steps;
};
