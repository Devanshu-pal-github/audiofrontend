import React, { useState } from "react";
import { Dialog, Button, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const ScheduleMeetingModal = ({ open, onClose, onConfirm, initialDate }) => {
    const [selectedDate, setSelectedDate] = useState(initialDate || null);
    const [selectedTime, setSelectedTime] = useState(null);

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            const date = dayjs(selectedDate).format('YYYY-MM-DD');
            const time = dayjs(selectedTime).format('HH:mm');
            onConfirm({ date, time });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <div className="p-6 flex flex-col gap-4">
                <h2 className="text-lg font-semibold mb-2">Schedule Meeting</h2>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                    <TimePicker
                        label="Select Time"
                        value={selectedTime}
                        onChange={setSelectedTime}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </LocalizationProvider>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose} variant="outlined">Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" disabled={!selectedDate || !selectedTime}>
                        Confirm
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ScheduleMeetingModal;
