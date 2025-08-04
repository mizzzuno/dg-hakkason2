import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const CustomTextField = styled(TextField)({
  // Chrome, Safari, Edge のスピンボタン非表示
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  // Firefox のスピンボタン非表示
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
});

function NumberInputForm() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    const input = event.target.value;

    // 空文字、または先頭に0があっても許可（例: "0", "01", "123"）
    if (input === '' || /^[0-9]+$/.test(input)) {
      setValue(input);
    }
  };

  return (
    <CustomTextField
      label="0以上の整数を入力"
      type="text" // 半角バリデーションのため text を使用
      value={value}
      onChange={handleChange}
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        inputMode: 'numeric', // モバイルで数字キーボード表示
      }}
    />
  );
}

export default NumberInputForm;