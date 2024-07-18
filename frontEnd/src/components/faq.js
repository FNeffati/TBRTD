import React from "react";
import "../styling/faq.css";
import Header from "./Header";

const FAQ = () => {
    const faqs= [
        {
            question: "What is Twitter?",
            answer:
                "X.",
        },
        {
            question: "Who is the most awesome professor at New College?",
            answer: "Dr. Roy!",
        },
        {
            question:
                "How many questions does it take to makes a succesful FAQ Page?",
            answer: "IDK, please help!",
        }
    ];

    return (
        <div className="App">
            <Header />
            <div className="faqs">
                {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <p className="faq-question"><strong>{faq.question}</strong></p>
                        <p className="faq-answer">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQ;
