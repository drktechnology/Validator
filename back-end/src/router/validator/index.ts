import Base from '../Base'

import get from './get'
import list from './list'

export default Base.setRouter([
    {
        path : '/get',
        router : get,
        method : 'get'
    },
    {
        path : '/list',
        router : list,
        method : 'get'
    },    
])