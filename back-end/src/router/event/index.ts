import Base from '../Base'

import list from './list'


export default Base.setRouter([
    {
        path : '/list',
        router : list,
        method : 'get'
    }
])