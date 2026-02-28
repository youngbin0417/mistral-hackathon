import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiSetupModal from '@/components/ApiSetupModal';

describe('ApiSetupModal', () => {
    it('does not render if needsApiKey is false', () => {
        const { container } = render(
            <ApiSetupModal needsApiKey={false} apiKeyInput="" setApiKeyInput={() => { }} handleSaveApiKey={() => { }} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders modal if needsApiKey is true', () => {
        render(
            <ApiSetupModal needsApiKey={true} apiKeyInput="" setApiKeyInput={() => { }} handleSaveApiKey={() => { }} />
        );
        expect(screen.getByText('Welcome to Mistral Snap')).toBeInTheDocument();
    });

    it('disables the save button when input is empty', () => {
        render(
            <ApiSetupModal needsApiKey={true} apiKeyInput="   " setApiKeyInput={() => { }} handleSaveApiKey={() => { }} />
        );
        const btn = screen.getByRole('button', { name: /Save & Start Coding/i });
        expect(btn).toBeDisabled();
    });

    it('enables the save button and calls handler when text is present', () => {
        const mockSave = jest.fn();
        render(
            <ApiSetupModal needsApiKey={true} apiKeyInput="test-key" setApiKeyInput={() => { }} handleSaveApiKey={mockSave} />
        );
        const btn = screen.getByRole('button', { name: /Save & Start Coding/i });
        expect(btn).not.toBeDisabled();
        fireEvent.click(btn);
        expect(mockSave).toHaveBeenCalledTimes(1);
    });
});
