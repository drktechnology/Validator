import Base from '../Base'

import getPrice from './get_price'
import getTotalStake from './get_total_stake'
import getDetails from './get_details'

export default Base.setRouter([
    {
        path : '/get-price',
        router : getPrice,
        method : 'get'
    },
    {
        path : '/get-total-stake',
        router : getTotalStake,
        method : 'get'
    },
    {
        path : '/get-details',
        router : getDetails,
        method : 'get'
    },
])