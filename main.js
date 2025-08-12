document.addEventListener("DOMContentLoaded", () => {
	const cardStack = document.querySelector(".card-stack");
	let cards = [...document.querySelectorAll(".card")];
	let isSwiping = false;
	let startX = 0;
	let currentX = 0;
	let animationFrameId = null;

	const getDurationFromCSS = (
		variableName,
		element = document.documentElement
	) => {
		const value = getComputedStyle(element)
			?.getPropertyValue(variableName)
			?.trim();
		if (!value) return 0;
		if (value.endsWith("ms")) return parseFloat(value);
		if (value.endsWith("s")) return parseFloat(value) * 1000;
		return parseFloat(value) || 0;
	};

	const getActiveCard = () => cards[0];

	const updatePositions = () => {
		cards.forEach((card, i) => {
			card.style.setProperty("--i", i + 1);
			card.style.setProperty("--swipe-x", "0px");
			card.style.setProperty("--swipe-rotate", "0deg");
			card.style.opacity = "1";
		});
	};

	const applySwipeStyles = (deltaX) => {
		const card = getActiveCard();
		if (!card) return;
		card.style.setProperty("--swipe-x", `${deltaX}px`);
		card.style.setProperty("--swipe-rotate", `${deltaX * 0.2}deg`);
		card.style.opacity = 1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75;
	};

	const handleStart = (clientX) => {
		if (isSwiping) return;
		isSwiping = true;
		startX = currentX = clientX;
		const card = getActiveCard();
		card && (card.style.transition = "none");
	};

	const handleMove = (clientX) => {
		if (!isSwiping) return;
		cancelAnimationFrame(animationFrameId);
		animationFrameId = requestAnimationFrame(() => {
			currentX = clientX;
			const deltaX = currentX - startX;
			applySwipeStyles(deltaX);

			if (Math.abs(deltaX) > 50) handleEnd();
		});
	};

	const handleEnd = () => {
		if (!isSwiping) return;
		cancelAnimationFrame(animationFrameId);

		const deltaX = currentX - startX;
		const threshold = 50;
		const duration = getDurationFromCSS("--card-swap-duration");
		const card = getActiveCard();

		if (card) {
			card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

			if (Math.abs(deltaX) > threshold) {
				const direction = Math.sign(deltaX);

				card.style.setProperty("--swipe-x", `${direction * 300}px`);
				card.style.setProperty("--swipe-rotate", `${direction * 20}deg`);

				setTimeout(() => {
					card.style.setProperty("--swipe-rotate", `${-direction * 20}deg`);
				}, duration * 0.5);

				setTimeout(() => {
					cards = [...cards.slice(1), card];
					updatePositions();
				}, duration);
			}

			else {
				applySwipeStyles(0);
			}
		}

		isSwiping = false;
		startX = currentX = 0;
	};

	const addEventListeners = () => {
		cardStack?.addEventListener("pointerdown", ({ clientX }) =>
			handleStart(clientX)
		);
		cardStack?.addEventListener("pointermove", ({ clientX }) =>
			handleMove(clientX)
		);
		cardStack?.addEventListener("pointerup", handleEnd);
	};

	updatePositions();
	addEventListeners();
});
