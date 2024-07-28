import '../styling/Filters.css';
import React, { useRef, useState } from 'react';
import InformationTip from "./InformationTip";

/**
 * Filters component for rendering a dropdown with selectable options.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array<string>} props.options - An array of options to display in the dropdown.
 * @param {string} props.Title - The initial title to display on the dropdown.
 * @param {string} props.information - The information tip text to display.
 * @param {Function} props.onChange - Callback function to handle option changes.
 * @param {boolean} [props.isMultiChoice=true] - Flag to allow multiple selections.
 * @param {boolean} [props.changeTitleOnSelect=false] - Flag to change the title based on selected options.
 */
const Filters = ({ options, Title, information, onChange, isMultiChoice = true, changeTitleOnSelect = false }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(Title);
    const dropdownRef = useRef(null);

    /**
     * Handles option change event.
     * @param {string} option - The selected option.
     */
    const handleOptionChange = (option) => {
        if (isMultiChoice) {
            // Multi-choice
            const updatedOptions = selectedOptions.includes(option)
                ? selectedOptions.filter((o) => o !== option)
                : [...selectedOptions, option];

            setSelectedOptions(updatedOptions);
            onChange(updatedOptions);

            if (changeTitleOnSelect) {
                if (updatedOptions.length === 0) {
                    setCurrentTitle(Title);
                } else {
                    setCurrentTitle(updatedOptions.join(', '));
                }
            }
        } else {
            // Single-choice
            if (!selectedOptions.includes(option)) {
                setSelectedOptions([option]);
                onChange([option]);
                if (changeTitleOnSelect) {
                    setCurrentTitle(option);
                }
            } else {
                setSelectedOptions([]);
                onChange([]);
                if (changeTitleOnSelect) {
                    setCurrentTitle(Title);
                }
            }
        }
    };

    /**
     * Handles mouse enter event to open the dropdown.
     */
    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    /**
     * Handles mouse leave event to close the dropdown.
     * @param {Event} event - The mouse leave event.
     */
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

            <div className="dropdown-header">{currentTitle} ▼</div>
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
