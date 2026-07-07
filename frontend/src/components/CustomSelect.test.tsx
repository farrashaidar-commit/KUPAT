import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CustomSelect from './CustomSelect';

describe('CustomSelect', () => {
  it('selects an option on click without immediately closing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={[
          { value: 'income', label: 'Pendapatan' },
          { value: 'expense', label: 'Pengeluaran' },
        ]}
        placeholder="Pilih..."
      />
    );

    await user.click(screen.getByRole('button', { name: /pilih/i }));
    await user.click(screen.getByRole('option', { name: 'Pendapatan' }));

    expect(handleChange).toHaveBeenCalledWith('income');
  });
});
