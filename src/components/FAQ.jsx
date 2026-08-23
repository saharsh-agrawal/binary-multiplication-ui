const FAQ = () => {
	return (
		<section
			style={{
				marginTop: "40px",
				padding: "24px",
				background: "#fff",
				borderRadius: "12px",
				color: "#2c3e50",
				boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
			}}
		>
			<h2>About Binary Multiplication Algorithms</h2>

			<article style={{ marginBottom: "20px" }}>
				<h3>What is Booth's Algorithm?</h3>
				<p>
					Booth's multiplication algorithm is a hardware-level
					procedure that multiplies two signed binary integers in
					two's complement notation. It optimizes the multiplication
					process by skipping strings of 0s and 1s, reducing the total
					number of required additions and subtractions.
				</p>
			</article>

			<article style={{ marginBottom: "20px" }}>
				<h3>Why do we use Arithmetic Shift Right (ASR)?</h3>
				<p>
					In signed multiplication, preserving the sign bit is
					crucial. An Arithmetic Shift Right moves all bits to the
					right but fills the most significant bit (MSB) with a copy
					of itself. This ensures that a negative number remains
					negative and a positive number remains positive during the
					shift.
				</p>
			</article>

			<article>
				<h3>Signed vs. Unsigned Shift-and-Add</h3>
				<p>
					Unsigned shift-and-add treats all bits as magnitude.
					However, in the signed (Modified) shift-and-add method, the
					most significant bit holds a negative positional weight.
					Therefore, when the final bit of the multiplier is a 1, the
					algorithm subtracts the multiplicand instead of adding it.
				</p>
			</article>
		</section>
	);
};

export default FAQ;
