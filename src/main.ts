import "./style.css";

type Outcome = "B" | "P" | "T";

/* =========================================================
   EZ BACCARAT LOGIC
   ========================================================= */

function drawCard(): number {
    const card = Math.floor(Math.random() * 13) + 1;
    return Math.min(card, 10);
}

function handTotal(hand: number[]): number {
    return hand.reduce((sum, card) => sum + card, 0) % 10;
}

function outcome(
    pt: number,
    bt: number,
    includeDragon7: boolean
): Outcome {

    if (pt > bt) {
        return "P";
    }

    if (bt > pt) {
        if (includeDragon7 && bt === 7) {
            return "T";
        }

        return "B";
    }

    return "T";
}

function ezBaccaratRound(includeDragon7: boolean): Outcome {

    const player: number[] = [
        drawCard(),
        drawCard()
    ];

    const banker: number[] = [
        drawCard(),
        drawCard()
    ];

    let playerTotal = handTotal(player);
    let bankerTotal = handTotal(banker);

    // Natural
    if (playerTotal >= 8 || bankerTotal >= 8) {
        return outcome(
            playerTotal,
            bankerTotal,
            includeDragon7
        );
    }

    // Player third card
    let playerThird: number | null = null;

    if (playerTotal <= 5) {

        playerThird = drawCard();

        player.push(playerThird);

        playerTotal = handTotal(player);
    }

    // Banker drawing rules
    if (playerThird === null) {

        if (bankerTotal <= 5) {
            banker.push(drawCard());
        }

    } else {

        if (bankerTotal <= 2) {
            banker.push(drawCard());

        } else if (
            bankerTotal === 3 &&
            playerThird !== 8
        ) {
            banker.push(drawCard());

        } else if (
            bankerTotal === 4 &&
            playerThird >= 2 &&
            playerThird <= 7
        ) {
            banker.push(drawCard());

        } else if (
            bankerTotal === 5 &&
            playerThird >= 4 &&
            playerThird <= 7
        ) {
            banker.push(drawCard());

        } else if (
            bankerTotal === 6 &&
            (playerThird === 6 || playerThird === 7)
        ) {
            banker.push(drawCard());
        }
    }

    bankerTotal = handTotal(banker);

    return outcome(
        playerTotal,
        bankerTotal,
        includeDragon7
    );
}

/* =========================================================
   SIMULATION
   ========================================================= */

interface SimulationResult {
    shoesWithPattern: number;
    totalHits: number;
    averageHits: number;
    standardDeviation: number;
    variance: number;
    hitWinRate: number;
    winsPerShoe: number;
}

function runSimulation(
    pattern: string,
    shoes: number,
    includeTie: boolean,
    includeDragon7: boolean
): SimulationResult {

    const patternArray = pattern.split("") as Outcome[];

    const patternLength = patternArray.length;

    let shoesWithPattern = 0;
    let totalHits = 0;
    let totalWins = 0;

    let totalActiveBets = 0;

    const shoeHitCounts: number[] = [];

    for (let shoe = 0; shoe < shoes; shoe++) {

        const hands = randomInteger(72, 80);

        const sequence: Outcome[] = [];

        for (let hand = 0; hand < hands; hand++) {

            const result = ezBaccaratRound(includeDragon7);

            if (includeTie) {
                sequence.push(result);
            } else {

                if (result !== "T") {
                    sequence.push(result);
                }
            }
        }

        let shoeHits = 0;
        let shoeWins = 0;

        for (
            let i = 0;
            i <= sequence.length - patternLength;
            i++
        ) {

            const window = sequence.slice(
                i,
                i + patternLength
            );

            const matches = window.every(
                (value, index) =>
                    value === patternArray[index]
            );

            if (!matches) {
                continue;
            }

            shoeHits++;

            /*
             * Look at the outcome immediately
             * following the pattern.
             */
            if (i + patternLength < sequence.length) {

                const nextHand =
                    sequence[i + patternLength];

                if (nextHand !== "T") {

                    totalActiveBets++;

                    /*
                     * Win if next hand equals
                     * final outcome of pattern.
                     */
                    if (
                        nextHand ===
                        patternArray[patternLength - 1]
                    ) {
                        shoeWins++;
                    }
                }
            }
        }

        shoeHitCounts.push(shoeHits);

        totalHits += shoeHits;
        totalWins += shoeWins;

        if (shoeHits > 0) {
            shoesWithPattern++;
        }
    }

    const averageHits =
        totalHits / shoes;

    let variance = 0;

    if (shoes > 1) {

        variance =
            shoeHitCounts.reduce(
                (sum, value) =>
                    sum +
                    Math.pow(
                        value - averageHits,
                        2
                    ),
                0
            ) / (shoes - 1);

    } else {

        variance =
            shoeHitCounts.reduce(
                (sum, value) =>
                    sum +
                    Math.pow(
                        value - averageHits,
                        2
                    ),
                0
            ) / shoes;
    }

    const standardDeviation =
        Math.sqrt(variance);

    const hitWinRate =
        totalActiveBets > 0
            ? (totalWins / totalActiveBets) * 100
            : 0;

    const winsPerShoe =
        totalWins / shoes;

    return {
        shoesWithPattern,
        totalHits,
        averageHits,
        standardDeviation,
        variance,
        hitWinRate,
        winsPerShoe
    };
}

/* =========================================================
   UTILITIES
   ========================================================= */

function randomInteger(
    min: number,
    max: number
): number {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

/* =========================================================
   HTML
   ========================================================= */

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `

<div class="container">

    <header>
        <h1>
            EZ Baccarat Pattern
            Frequency Analyzer
        </h1>

        <p class="author">
            Long Nguyen
        </p>
    </header>

    <section class="card">

        <div class="form-group">

            <label for="pattern">
                Pattern (B / P / T)
            </label>

            <input
                id="pattern"
                type="text"
                value="PPBBPPBB"
                maxlength="30"
                autocomplete="off"
                spellcheck="false"
            />

        </div>

        <div class="form-group">

            <label for="shoes">
                Number of Shoes
            </label>

            <input
                id="shoes"
                type="number"
                value="10000"
                min="1"
                max="1000000"
            />

        </div>

        <label class="checkbox-row">

            <input
                id="includeTie"
                type="checkbox"
            />

            <span>
                Include Ties in Pattern
            </span>

        </label>

        <label class="checkbox-row">

            <input
                id="dragon7"
                type="checkbox"
                checked
            />

            <span>
                Include Dragon 7
                (Banker 7 = Tie)
            </span>

        </label>

        <button id="runButton">
            RUN SIMULATION
        </button>

    </section>

    <section class="card">

        <h2>Simulation Results</h2>

        <div id="results">

            Enter a pattern and click
            <strong>RUN SIMULATION</strong>.

        </div>

    </section>

</div>
`;

/* =========================================================
   EVENT HANDLER
   ========================================================= */

const patternInput =
    document.querySelector<HTMLInputElement>(
        "#pattern"
    )!;

const shoesInput =
    document.querySelector<HTMLInputElement>(
        "#shoes"
    )!;

const tieInput =
    document.querySelector<HTMLInputElement>(
        "#includeTie"
    )!;

const dragonInput =
    document.querySelector<HTMLInputElement>(
        "#dragon7"
    )!;

const runButton =
    document.querySelector<HTMLButtonElement>(
        "#runButton"
    )!;

const results =
    document.querySelector<HTMLDivElement>(
        "#results"
    )!;

runButton.addEventListener(
    "click",
    () => {

        const pattern =
            patternInput.value
                .trim()
                .toUpperCase();

        const shoes =
            Number(shoesInput.value);

        const includeTie =
            tieInput.checked;

        const includeDragon7 =
            dragonInput.checked;

        /* -----------------------------
           Validation
           ----------------------------- */

        if (!pattern) {

            showError(
                "Please enter a pattern."
            );

            return;
        }

        if (!/^[BPT]+$/.test(pattern)) {

            showError(
                "Pattern may only contain B, P, or T."
            );

            return;
        }

        if (
            !Number.isInteger(shoes) ||
            shoes < 1
        ) {

            showError(
                "Please enter a valid number of shoes."
            );

            return;
        }

        /* -----------------------------
           Disable button while running
           ----------------------------- */

        runButton.disabled = true;

        runButton.textContent =
            "RUNNING...";

        results.innerHTML = `
            <div class="running">
                Simulation running...
            </div>
        `;

        /*
         * setTimeout allows the browser to
         * update the screen before a large
         * simulation starts.
         */
        setTimeout(() => {

            const result =
                runSimulation(
                    pattern,
                    shoes,
                    includeTie,
                    includeDragon7
                );

            const occurrenceRate =
                (
                    result.shoesWithPattern /
                    shoes
                ) * 100;

            results.innerHTML = `

                <div class="result-grid">

                    <div class="result-row">
                        <span>Shoes Tested</span>
                        <strong>
                            ${formatNumber(shoes)}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Pattern</span>
                        <strong>
                            ${pattern}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Shoes With Pattern</span>
                        <strong>
                            ${formatNumber(
                                result.shoesWithPattern
                            )}
                            (${occurrenceRate.toFixed(2)}%)
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Total Pattern Hits</span>
                        <strong>
                            ${formatNumber(
                                result.totalHits
                            )}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Average Hits / Shoe</span>
                        <strong>
                            ${result.averageHits.toFixed(3)}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Standard Deviation</span>
                        <strong>
                            ${result.standardDeviation.toFixed(4)}
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Variance</span>
                        <strong>
                            ${result.variance.toFixed(4)}
                        </strong>
                    </div>

                    <div class="result-row highlight">
                        <span>Hit Win Rate</span>
                        <strong>
                            ${result.hitWinRate.toFixed(2)}%
                        </strong>
                    </div>

                    <div class="result-row">
                        <span>Wins Per Shoe</span>
                        <strong>
                            ${result.winsPerShoe.toFixed(3)}
                        </strong>
                    </div>

                </div>

                <div class="note">

                    <strong>Betting assumption:</strong>

                    The simulation assumes a bet is placed
                    on the hand immediately following
                    the detected pattern.

                    The next hand is considered a win
                    when it matches the final outcome
                    of the pattern.

                </div>

            `;

            runButton.disabled = false;

            runButton.textContent =
                "RUN SIMULATION";

        }, 20);
    }
);

/* =========================================================
   DISPLAY HELPERS
   ========================================================= */

function formatNumber(
    value: number
): string {

    return value.toLocaleString(
        "en-US"
    );
}

function showError(
    message: string
): void {

    results.innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;
}
