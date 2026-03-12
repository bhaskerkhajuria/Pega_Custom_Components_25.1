
import React from 'react';
import { Button, useToaster } from '@pega/cosmos-react-core';

import type { PConnFieldProps } from '../shared/PConnProps';


// interface for props
interface MyOrgMyLibSelectAndSearchWorkProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  variant: any;

}

export default function GetNextWork(props: MyOrgMyLibSelectAndSearchWorkProps) {
  const { getPConnect, variant } = props;

  const toasterCtx = useToaster();

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Case';

  const getNextWork = () => {

    // alert('Get next work clicked');

    getPConnect()
      .getActionsApi()
      .getNextWork()
      .catch((err) => {
        console.log(err);
        if (err[0].status === 404) {
          toasterCtx.push({
            content: localizedVal('No task currently available', localeCategory)
          });
        }
      });
  };

  return (
    <Button variant={variant} onClick={getNextWork}>
      {getPConnect().getLocalizedValue('Get next work', '', '')}
    </Button>
  );
}
