import { useAccountDeriveBalancesAll, useApi, useBalanceFormat } from '@gear-js/react-hooks';


const Balance = () => {
  const { isApiReady } = useApi();
  const balances = useAccountDeriveBalancesAll();
  const { getFormattedBalance } = useBalanceFormat();

  const formattedBalance = isApiReady && balances ? getFormattedBalance(balances.freeBalance) : undefined;

  return formattedBalance ? (
    <section >
      <h2 >Balance:</h2>

      <p >
        <span >{formattedBalance.value}</span>
        <span >{formattedBalance.unit}</span>
      </p>
    </section>
  ) : null;
};

export { Balance };
