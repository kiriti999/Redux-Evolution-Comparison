# RTK Built-in Optimizations Examples

## 1. IMMER'S STRUCTURAL SHARING

**WITHOUT RTK (Manual immutable updates):**

```javascript
const manualReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_USER_NAME':
      return {
        ...state,
        users: {
          ...state.users,
          byId: {
            ...state.users.byId,
            [action.payload.id]: {
              ...state.users.byId[action.payload.id],
              name: action.payload.name
            }
          }
        }
      };
    default:
      return state;
  }
};
```

**WITH RTK (Immer handles this automatically):**

```javascript
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    byId: {},
    allIds: []
  },
  reducers: {
    updateUserName: (state, action) => {
      state.users.byId[action.payload.id].name = action.payload.name;
    }
  }
});
```

**What Immer Actually Does:**

```javascript
const initialState = {
  users: {
    byId: {
      '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
      '2': { id: '2', name: 'Bob', email: 'bob@example.com' },
      '3': { id: '3', name: 'Charlie', email: 'charlie@example.com' }
    },
    allIds: ['1', '2', '3']
  },
  posts: {
    byId: {
      'a': { id: 'a', title: 'Post A', authorId: '1' },
      'b': { id: 'b', title: 'Post B', authorId: '2' }
    },
    allIds: ['a', 'b']
  }
};

const optimizedUpdate = (prevState, action) => {
  const newState = {
    ...prevState,
    users: {
      ...prevState.users,
      byId: {
        ...prevState.users.byId,
        [action.payload.id]: {
          ...prevState.users.byId[action.payload.id],
          name: action.payload.name
        }
      }
    }
  };
  
  return newState;
};
```

## 2. AUTOMATIC SERIALIZATION CHECKS

```javascript
const problemSlice = createSlice({
  name: 'problem',
  initialState: { data: null },
  reducers: {
    setBadData: (state, action) => {
      state.data = {
        date: new Date(),           // ❌ Not serializable
        function: () => {},         // ❌ Not serializable
        promise: Promise.resolve(), // ❌ Not serializable
        map: new Map(),            // ❌ Not serializable
        set: new Set()             // ❌ Not serializable
      };
    },
    
    setGoodData: (state, action) => {
      state.data = {
        timestamp: Date.now(),      // ✅ Serializable
        value: action.payload,      // ✅ Serializable
        array: [1, 2, 3],          // ✅ Serializable
        object: { key: 'value' }   // ✅ Serializable
      };
    }
  }
});
```

## 3. AUTOMATIC MUTATION DETECTION

```javascript
const mutationDetectionSlice = createSlice({
  name: 'mutationDetection',
  initialState: { items: [], count: 0 },
  reducers: {
    badUpdate: (state, action) => {
      state.items.push(action.payload); // ✅ Safe with Immer
    }
  }
});

const component = () => {
  const items = useSelector(state => state.mutationDetection.items);
  
  const handleClick = () => {
    // items.push('new item'); // ❌ Mutating Redux state directly
  };
};
```

## 4. PERFORMANCE COMPARISON

**Manual immutable update:**

```javascript
const manualDeepUpdate = (state, path, value) => {
  return {
    ...state,
    level1: {
      ...state.level1,
      level2: {
        ...state.level1.level2,
        level3: {
          ...state.level1.level2.level3,
          level4: {
            ...state.level1.level2.level3.level4,
            [path]: value
          }
        }
      }
    }
  };
};
```

**RTK with Immer:**

```javascript
const rtkDeepUpdate = createSlice({
  name: 'deep',
  initialState: {
    level1: {
      level2: {
        level3: {
          level4: {
            targetValue: 'original'
          }
        }
      }
    }
  },
  reducers: {
    updateDeepValue: (state, action) => {
      state.level1.level2.level3.level4.targetValue = action.payload;
    }
  }
});
```

## 5. MEMORY USAGE OPTIMIZATION

```javascript
const demonstrateMemoryOptimization = () => {
  const largeArray = new Array(10000).fill(0).map((_, i) => ({
    id: i,
    data: `Item ${i}`,
    metadata: { created: Date.now(), index: i }
  }));

  const initialState = {
    items: largeArray,
    selectedId: null,
    filters: { active: true, category: 'all' }
  };

  // Manual approach
  const manualUpdate = (state, selectedId) => ({
    ...state,
    items: [...state.items], // ❌ Unnecessary copy of 10,000 items
    selectedId
  });

  // RTK approach
  const rtkSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
      selectItem: (state, action) => {
        state.selectedId = action.payload; // ✅ items array stays same reference
      },
      updateItem: (state, action) => {
        const { id, data } = action.payload;
        state.items[id] = { ...state.items[id], data }; // ✅ Only one item copied
      }
    }
  });
};
```

## 6. SELECTOR OPTIMIZATION BENEFITS

```javascript
const ComponentWithSelectors = () => {
  const posts = useSelector(state => state.posts.byId);
  const currentUser = useSelector(state => state.users.byId[state.auth.currentUserId]);
  const filters = useSelector(state => state.ui.filters);
  
  const filteredPosts = useSelector(state => {
    const { posts, ui } = state;
    return Object.values(posts.byId).filter(post => 
      ui.filters.category === 'all' || post.category === ui.filters.category
    );
  });

  return <div>{/* Component content */}</div>;
};
```

## 7. COMPARISON: Before and After RTK

**BEFORE RTK:**

```javascript
const beforeRTK = {
  reducer: (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return {
          ...state,
          todos: {
            ...state.todos,
            byId: {
              ...state.todos.byId,
              [action.payload.id]: action.payload
            },
            allIds: [...state.todos.allIds, action.payload.id]
          }
        };
      
      case 'TOGGLE_TODO':
        return {
          ...state,
          todos: {
            ...state.todos,
            byId: {
              ...state.todos.byId,
              [action.payload.id]: {
                ...state.todos.byId[action.payload.id],
                completed: !state.todos.byId[action.payload.id].completed
              }
            }
          }
        };
      
      default:
        return state;
    }
  },

  selectors: {
    getTodoById: createSelector(
      [(state, id) => state.todos.byId[id]],
      (todo) => todo
    )
  }
};
```

**AFTER RTK:**

```javascript
const afterRTK = createSlice({
  name: 'todos',
  initialState: {
    byId: {},
    allIds: []
  },
  reducers: {
    addTodo: (state, action) => {
      state.byId[action.payload.id] = action.payload;
      state.allIds.push(action.payload.id);
    },
    
    toggleTodo: (state, action) => {
      const todo = state.byId[action.payload.id];
      todo.completed = !todo.completed;
    }
  }
});
```

## 8. REAL-WORLD PERFORMANCE IMPACT

```javascript
const performanceTest = () => {
  const largeState = {
    users: {},
    posts: {},
    comments: {},
  };

  for (let i = 0; i < 10000; i++) {
    largeState.users[i] = { id: i, name: `User ${i}` };
    largeState.posts[i] = { id: i, title: `Post ${i}`, userId: i };
    largeState.comments[i] = { id: i, text: `Comment ${i}`, postId: i };
  }

  // Manual update
  console.time('Manual Update');
  const manualResult = {
    ...largeState,
    users: {
      ...largeState.users,
      1: { ...largeState.users[1], name: 'Updated User' }
    }
  };
  console.timeEnd('Manual Update');

  // RTK update
  const slice = createSlice({
    name: 'test',
    initialState: largeState,
    reducers: {
      updateUser: (state, action) => {
        state.users[action.payload.id].name = action.payload.name;
      }
    }
  });

  console.time('RTK Update');
  const rtkResult = slice.reducer(largeState, {
    type: 'test/updateUser',
    payload: { id: 1, name: 'Updated User' }
  });
  console.timeEnd('RTK Update');

  console.log('Posts reference same?', largeState.posts === rtkResult.posts); // true
  console.log('Comments reference same?', largeState.comments === rtkResult.comments); // true
  console.log('User 2 reference same?', largeState.users[2] === rtkResult.users[2]); // true
  console.log('User 1 reference same?', largeState.users[1] === rtkResult.users[1]); // false
};
```

## 9. BUNDLE SIZE OPTIMIZATION

**Before:**

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { produce } from 'immer';
```

**After:**

```javascript
import { configureStore, createSlice } from '@reduxjs/toolkit';
```

## 10. DEVELOPMENT VS PRODUCTION OPTIMIZATIONS

```javascript
const developmentOptimizations = {
  serializableCheck: true,
  immutableCheck: true,
  actionTypeCheck: true,
  devTools: true
};

const productionOptimizations = {
  serializableCheck: false,
  immutableCheck: false,
  actionTypeCheck: false,
  minified: true,
  optimizedImmer: true
};

const store = configureStore({
  reducer: {
    todos: todosSlice.reducer
  }
});
```