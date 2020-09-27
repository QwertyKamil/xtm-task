import * as React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
    position: relative;
    display: flex;
    align-items: center;
    span {
        position: absolute;
        left: 10px;
        transform: ${({ value }) => (!value ? 'translateY(0) scale(1)' : 'translateY(-15px) scale(0.8)')};
        transition: transform 0.2s ease-in-out;
    }
    input {
        border-radius: 10px;
        font-size: 20px;
        padding: 5px 10px;
        border: 1px solid #dadada;
        :focus ~ span {
            transform: translateY(-15px) scale(0.8);
        }
    }
`;

export const Label = ({ children, text, ...props }) => {
    return (
        <StyledLabel {...props}>
            {children}
            <span>{text}</span>
        </StyledLabel>
    );
};
