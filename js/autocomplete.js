let mclimit, fitblimit, punctuation;
const urls = ["/multiple_choice.php", "/fill_in_the_blank.php", "/player_cdn.php"];

(function () {
    if (!urls.includes(location.pathname)) return;

    function start(type) {
        answerQuestion(type);
        setTimeout(() => {
            let totalPoints = document.getElementsByClassName("total_points")[0];
            let allTimePoints = document.getElementsByClassName("score_history_link")[0].innerText.split(" ")[0];

            if (
                totalPoints.innerText !== "" &&
                ((type === "mc" &&
                    allTimePoints >= (mclimit ? mclimit : 200)) ||
                    (type === "fitb" &&
                        allTimePoints >= (fitblimit ? fitblimit : 100)))
            ) {
                document.getElementsByClassName("quitgame")[0].click();
                return;
            }
            if (totalPoints.innerText !== "") {
                document.getElementsByClassName("play_again")[0].click();
                totalPoints.innerText = "";
                setTimeout(() => (type === "mc" ? start(type) : start(type)), 2000);
                return;
            }
            type === "mc" ? start(type) : start(type)
        }, 4200)
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "`") {
            document.getElementsByClassName("blue button start_game")[0].click()
            setTimeout(() => start(location.pathname === "/multiple_choice.php" ? "mc" : "fitb"), 2000)
        }
    })

    function generateTranscript() {
        const transcript_obj = Array.from(
            document.getElementsByTagName("script")
        ).map((script) => script.innerText.includes("var captions") && 
            JSON.parse(
                script.innerText.split("\t")[3].split("var captions = $.extend(").join("").split(", PlayerCommon.Mixins.Captions),\n").join("").replace(/(\r\n|\n|\r)/gm, "")
            )
        ).filter((item) => item)[0];

        return location.pathname === "/player_cdn.php"
            ? punctuation
                ? CAPTIONS.map((item) => item.transcript).join(" ")
                : CAPTIONS.map((item) =>
                      item.transcript_words.map(({ word }) => word)
                  ).map((arr) => arr.join(" ")).join(" ")
            : punctuation
            ? transcript_obj.map((item) => item.transcript).join(" ")
            : transcript_obj.map((item) => item.transcript_words.map(({ word }) => word)).map((arr) => arr.join(" ")).join(" ")
    }

    function answerQuestion(type) {
        const transcript = generateTranscript();

        let words = document.getElementsByClassName("question")[0].children;
        let options = document.getElementsByClassName("choice_buttons")[0].children;

        let blankIndex, correctAnswer, correctAnswerIndex;

        for (let i = 0; i < words.length; i++)
            if (words[i].classList.contains("underline")) blankIndex = i;

        if (blankIndex === 0) {
            let wordsAfterBlank = "";

            for (let i = 1; i < words.length; i++)
                wordsAfterBlank += `${words[i].innerText} `

            type === "mc"
                ? Array.from(options).forEach((option, i) => {
                      transcript.includes(
                          `${option.innerText} ${wordsAfterBlank}`
                      ) && (correctAnswerIndex = i)
                  })
                : (correctAnswer = transcript.match(
                      new RegExp(
                          "(\\p{L}+)(?=\\s" + wordsAfterBlank.trim() + "\\b)",
                          "gui"
                      )
                  )[0])
        } else {
            let wordsBeforeBlank = "";

            for (let i = 0; i < blankIndex; i++)
                wordsBeforeBlank += `${words[i].innerText} `

            if (type === "mc") {
                Array.from(options).forEach((option, i) => {
                    transcript.includes(`${wordsBeforeBlank}${option.innerText}`) && (correctAnswerIndex = i)
                })
            } else if (type === "fitb") {
                correctAnswer = transcript.match(new RegExp("(?<=\\b" + wordsBeforeBlank.trim() + "\\s)(\\p{L}+)", "gui"))[0];
            }
        }

        if (type === "mc") options[correctAnswerIndex].click();
        if (type === "fitb") {
            document.getElementsByClassName("answer")[0].value = correctAnswer;
            document.getElementById("submit_answer").click();
            setTimeout(() => {
                document.getElementsByClassName("next")[0].click();
            }, 2000)
        }
    }
})()