import '../styling/Filters.css';
import React, { useRef, useState } from 'react';
import InformationTip from "./InformationTip";

const Filters = ({ options, Title, information, onChange, isMultiChoice = true }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleOptionChange = (option) => {
        if (isMultiChoice) {
            // Multi-choice
            const updatedOptions = selectedOptions.includes(option)
                ? selectedOptions.filter((o) => o !== option)
                : [...selectedOptions, option];

            setSelectedOptions(updatedOptions);
            onChange(updatedOptions);
        } else {
            // Single-choice
            if (!selectedOptions.includes(option)) {
                setSelectedOptions([option]);
                onChange([option]);
            } else {
                setSelectedOptions([]);
                onChange([]);
            }
        }
    };

    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    const handleMouseLeave = (event) => {
        if (dropdownRef.current) {
            setIsOpen(false);
        }
    };

    return (
        <div
            className="dropdown-container"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <InformationTip information={information} />

            <div className="dropdown-header">{Title} ▼</div>
            {isOpen && (
                <div className="dropdown-content">
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`dropdown-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
                            onClick={() => handleOptionChange(option)}
                        >
                            <span className="checkbox-container">
                                {selectedOptions.includes(option) && <span className="checkbox">&#10003;</span>}
                            </span>
                            <span>{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Filters;