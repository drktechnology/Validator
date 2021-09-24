import Base from '../Base'

import get from './get'

export default Base.setRouter([
    {
        path : '/get',
        router : get,
        method : 'get'
    },  
])