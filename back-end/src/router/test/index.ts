import Base from '../Base'

import claim_faucet from './claim_faucet'
import list_faucet from './list_faucet'

export default Base.setRouter([
    {
        path : '/claim_faucet',
        router : claim_faucet,
        method : 'post'
    },
    {
        path : '/list_faucet',
        router : list_faucet,
        method : 'get'
    },  
])