import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';

const token = localStorage.getItem('token');
const config = {
    headers: { Authorization: `Bearer ${token}` }
};

export const getWarehouses = createAsyncThunk('warehouses/getWarehouses', async (_data) => {
    const response = await axios.get('https://API-ENDPOINT/list?page=' + _data.page + '&limit=' + _data.limit, config);

    const data = await response.data.data;
    data.map((item) => item.id = item._id); // id must be unique
    console.log('warehouses', response.data);
    return data;
});

export const addWarehouse = createAsyncThunk('warehouses/addWarehouse', async (_data, { dispatch }) => {
    _data.created_by = '_ID'
    console.log('data submit api', _data)

    const response = await axios.post('https://API-ENDPOINT/create', _data, config);

    const data = await response.data.data;
    console.log('add warehouse', response.data.data);
    data['id'] = data['_id'];
    dispatch(
        showMessage({
            message: data.message,
            variant: 'success',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        })
    );
    return data;
});

export const getWarehouse = createAsyncThunk('warehouses/getWarehouse', async (_data) => {
    const response = await axios.get('https://API-ENDPOINT/get/' + _data.id, config);
    const data = await response.data.data;
    data['id'] = data.warehouse['_id'];
    console.log('get Warehouse', data);
    return data;
});

export const updateWarehouse = createAsyncThunk('warehouses/updateWarehouse', async (_data, { dispatch }) => {
    var req = {
        "id": _data.id,
        "warehouse_name": _data.warehouse_name,
        "address1": _data.address1,
        "address2": _data.address2,
        "city": _data.city,
        "state": _data.state,
        "country_id": _data.country_id,
        "pincode": _data.pincode
    }
    const response = await axios.put('https://API-ENDPOINT/update', req, config);
    var data = await response.data.data;
    console.log('update warehouse', response.data.data);

    var res = {
        "isActive": true,
        "_id": data['id'],
        "id": data['id'],
        "warehouse_name": data.warehouse_name,
        "created_at": data.created_at,
        "created_by": {
            "_id": "611e299e7b7e365f9e8d1636",
            "first_name": "Delivery",
            "last_name": "Tracker"
        },
        "__v": 0
    }
    dispatch(
        showMessage({
            message: response.data.message,
            variant: 'success',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        })
    );
    return res;
});

export const updateWarehouseStatus = createAsyncThunk('users/updateWarehouseStatus', async (eventId, { dispatch }) => {
    const response = await axios.put('https://API-ENDPOINT/status/update', { id: eventId, "isActive": false }, config);
    var data = await response.data.data;
    console.log('updateWarehouseStatus', response.data.data);
    data['id'] = data['_id'];
    dispatch(
        showMessage({
            message: response.data.message,
            variant: 'success',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        })
    );
    return data['id'];
});

export const removeWarehouse = createAsyncThunk('warehouses/removeWarehouse', async (eventId, { dispatch }) => {
    const _request = {
        "token": _token,
        "id": eventId,
    }
    const response = await axios.put('https://API-ENDPOINT/status/update', _request);
    const data = await response.data;
    console.log('remove warehouses', response.data);
    dispatch(
        showMessage({
            message: response.data.message,
            variant: 'success',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        })
    );
    return eventId;
});

const warehousesAdapter = createEntityAdapter({});

export const { selectAll: selectWarehouses, selectIds: selectWarehouseById } = warehousesAdapter.getSelectors(
    state => state.warehouses.warehouselist
);

const warehuseSlice = createSlice({
    name: 'warehouses',
    initialState: warehousesAdapter.getInitialState({
        searchText: '',
        warehouseDialog: {
            type: 'new',
            props: {
                open: false
            },
            data: null
        },
        confirmationDialog: {
            type: 'delete',
            props: {
                open: false
            },
            data: null
        }
    }),
    reducers: {
        setWarehousesSearchText: {
            reducer: (state, action) => {
                state.searchText = action.payload;
            },
            prepare: event => ({ payload: event.target.value || '' })
        },
        openNewWarehouseDialog: {
            prepare: event => {
                const payload = {
                    type: 'new',
                    props: {
                        open: true
                    },
                    data: {
                        warehouse_name: '',
                        address1: '',
                        address2: '',
                        city: '',
                        state: '',
                        country_id: '',
                        pincode: ''
                    }
                };
                return { payload };
            },
            reducer: (state, action) => {
                state.warehouseDialog = action.payload;
            }
        },
        openConfirmationDialog: {
            prepare: event => {
                const payload = {
                    type: 'delete',
                    props: {
                        open: true
                    },
                    data: {
                        id: event.id,
                        warehouse_name: event.warehouse_name,
                    }
                };
                return { payload };
            },
            reducer: (state, action) => {
                state.confirmationDialog = action.payload;
            }
        },
        openEditWarehouseDialog: {
            prepare: (event) => {
                console.log('edit event ', event);
                const payload = {
                    type: 'edit',
                    props: {
                        open: true
                    },
                    data: {
                        ...event, ...event.warehouse,
                        id: event.warehouse._id,
                        warehouse_name: event.warehouse.warehouse_name,
                        address1: event.address[0].address1,
                        address2: event.address[0].address2,
                        city: event.address[0].city,
                        state: event.address[0].state,
                        country_id: event.address[0].country_id._id,
                        pincode: event.address[0].pincode
                    }
                };
                return { payload };
            },
            reducer: (state, action) => {
                state.warehouseDialog = action.payload;
            }
        },
        closeNewWarehouseDialog: (state, action) => {
            state.warehouseDialog = {
                type: 'new',
                props: {
                    open: false
                },
                data: null
            };
        },
        closeEditWarehouseDialog: (state, action) => {
            state.warehouseDialog = {
                type: 'edit',
                props: {
                    open: false
                },
                data: null
            };
        },
        closeConfirmationDialog: (state, action) => {
            state.confirmationDialog = {
                type: 'delete',
                props: {
                    open: false
                },
                data: null
            };
        }
    },
    extraReducers: {
        [getWarehouses.fulfilled]: warehousesAdapter.setAll,
        [getWarehouse.fulfilled]: warehousesAdapter.upsertOne,
        [addWarehouse.fulfilled]: warehousesAdapter.addOne,
        [updateWarehouse.fulfilled]: warehousesAdapter.upsertOne,
        [updateWarehouseStatus.fulfilled]: warehousesAdapter.removeOne,
        [removeWarehouse.fulfilled]: warehousesAdapter.removeOne
    }
});

export const { setWarehousesSearchText, openNewWarehouseDialog, closeNewWarehouseDialog, openEditWarehouseDialog, closeEditWarehouseDialog, openConfirmationDialog, closeConfirmationDialog } = warehuseSlice.actions;

export default warehuseSlice.reducer;