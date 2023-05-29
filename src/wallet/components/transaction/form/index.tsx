import { zodResolver } from '@hookform/resolvers/zod/dist/zod';
import { Button } from '@mui/material';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import styled from 'styled-components';

import Form from 'components/form';
import NumberInput from 'components/form/numberInput';
import ToggleButtonGroupInput from 'components/form/toggleButtonGroupInput';
import { useSnackbars } from 'snackbar';

import { walletDepositService, walletWithdrawService } from '../../../service';
import {
  ApiPostWalletData,
  TransactionFormData,
  TransactionType,
  TransactionTypes,
  WalletBalance,
} from '../../../types';
import { getTransactionFormSchema } from '../schema';
import { getTransactionFormDefaultValues } from '../utils';

type Props = {
  balance: WalletBalance;
};

const WalletTransactionForm: React.FC<Props> = ({ balance }) => {
  const methods = useForm<TransactionFormData>({
    defaultValues: getTransactionFormDefaultValues(),
    resolver: zodResolver(getTransactionFormSchema(balance.wallet_usd)),
  });

  const { handleSubmit, control, clearErrors, reset } = methods;
  const { enqueueSnackbarSuccess, enqueueSnackbarError } = useSnackbars();

  const amount = useWatch({ control, name: 'amount' });
  const transactionType = useWatch({ control, name: 'transactionType' });

  // clear errors on transactionType change
  useEffect(() => {
    clearErrors();
  }, [transactionType]);

  const onSubmit = handleSubmit((data: TransactionFormData) => {
    const transactionData = { amount: data.amount } satisfies ApiPostWalletData;

    (transactionType === TransactionType.DEPOSIT
      ? walletDepositService
      : walletWithdrawService)(transactionData)
      .then(() => {
        enqueueSnackbarSuccess('Transaction successful');
        reset();
      })
      .catch(() => {
        enqueueSnackbarError('Transaction failed');
      });
  });

  const disabledSubmitButton = amount <= 0;

  return (
    <StyledForm methods={methods} onSubmit={onSubmit}>
      <ToggleButtonGroupInput
        name="transactionType"
        options={TransactionTypes}
      />
      <NumberInput name="amount" label="Amount" />
      <StyledButton disabled={disabledSubmitButton} />
    </StyledForm>
  );
};

export default WalletTransactionForm;

const StyledForm = styled(Form)`
  max-width: 15rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
` as typeof Form;

const StyledButton = styled(Button).attrs(() => ({
  type: 'submit',
  variant: 'contained',
  children: 'Submit',
}))``;
