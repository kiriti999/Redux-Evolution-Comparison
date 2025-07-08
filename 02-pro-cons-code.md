# Redux Code Examples

## 1. REDUX CONNECT + mapStateToProps (Legacy)

### PROS Examples

**Explicit data flow and performance optimization:**

```javascript
const mapStateToProps = (state, ownProps) => ({
  user: state.users.byId[ownProps.userId],
  isLoading: state.users.loading,
  posts: state.posts.items.filter(post => post.userId === ownProps.userId)
});

const mapDispatchToProps = (dispatch) => ({
  fetchUser: (id) => dispatch(fetchUserAction(id)),
  updateUser: (user) => dispatch(updateUserAction(user))
});

class UserProfile extends React.Component {
  componentDidMount() {
    if (!this.props.user) {
      this.props.fetchUser(this.props.userId);
    }
  }

  render() {
    const { user, isLoading, posts } = this.props;
    
    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;
    
    return (
      <div>
        <h1>{user.name}</h1>
        <p>Posts: {posts.length}</p>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
```

**Easy to compose with other HOCs:**

```javascript
const withAuth = (Component) => (props) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? <Component {...props} /> : <Login />;
};

const withLogging = (Component) => (props) => {
  useEffect(() => {
    console.log('Component rendered with props:', props);
  });
  return <Component {...props} />;
};

export default compose(
  withAuth,
  withLogging,
  connect(mapStateToProps, mapDispatchToProps)
)(UserProfile);
```

### CONS Examples

**Verbose boilerplate:**

```javascript
const mapStateToProps = (state) => ({
  count: state.counter.value,
  step: state.counter.step
});

const mapDispatchToProps = (dispatch) => ({
  increment: () => dispatch({ type: 'INCREMENT' }),
  decrement: () => dispatch({ type: 'DECREMENT' }),
  setStep: (step) => dispatch({ type: 'SET_STEP', payload: step })
});

const Counter = ({ count, step, increment, decrement, setStep }) => (
  <div>
    <span>{count}</span>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
    <input 
      type="number" 
      value={step} 
      onChange={(e) => setStep(parseInt(e.target.value))} 
    />
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

**HOC wrapper hell:**

```javascript
const EnhancedComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withRouter(
    withAuth(
      withErrorBoundary(
        withLoading(
          withTheme(BaseComponent)
        )
      )
    )
  )
);
```

## 2. useSelector Hook (Modern Functional)

### PROS Examples

**Cleaner syntax and better TypeScript support:**

```javascript
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const user = useSelector((state: RootState) => state.users.byId[userId]);
  const isLoading = useSelector((state: RootState) => state.users.loading);
  const posts = useSelector((state: RootState) => 
    state.posts.items.filter(post => post.userId === userId)
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserAction(userId));
    }
  }, [user, userId, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Posts: {posts.length}</p>
      <button onClick={() => dispatch(updateUserAction(user))}>
        Update User
      </button>
    </div>
  );
};
```

**Flexible selectors:**

```javascript
const Dashboard = () => {
  const totalUsers = useSelector((state: RootState) => state.users.items.length);
  const activeUsers = useSelector(selectActiveUsers);
  const recentPosts = useSelector((state: RootState) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return state.posts.items.filter(post => post.createdAt > dayAgo);
  });

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Users: {totalUsers}</p>
      <p>Active Users: {activeUsers.length}</p>
      <p>Recent Posts: {recentPosts.length}</p>
    </div>
  );
};
```

### CONS Examples

**Potential performance issues:**

```javascript
const ProblematicComponent = () => {
  // BAD: Creates new object every render
  const userData = useSelector((state: RootState) => ({
    user: state.users.current,
    preferences: state.users.preferences,
    settings: state.users.settings
  }));

  // BAD: Complex computation in selector
  const expensiveData = useSelector((state: RootState) => 
    state.items.list
      .filter(item => item.active)
      .map(item => ({ ...item, computed: heavyComputation(item) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  return <div>{/* Component content */}</div>;
};
```

## 3. Redux Toolkit (RTK) with createSlice

### PROS Examples

**Significantly reduced boilerplate:**

```javascript
const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    step: 1
  },
  reducers: {
    increment: (state) => {
      state.value += state.step;
    },
    decrement: (state) => {
      state.value -= state.step;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.step = 1;
    }
  }
});

export const { increment, decrement, setStep, reset } = counterSlice.actions;

const Counter = () => {
  const { value, step } = useSelector((state: RootState) => state.counter);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{value}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <input 
        type="number" 
        value={step} 
        onChange={(e) => dispatch(setStep(parseInt(e.target.value)))} 
      />
      <button onClick={() => dispatch(reset())}>Reset</button>
    </div>
  );
};
```

**RTK Query for data fetching:**

```javascript
const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User']
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    updateUser: builder.mutation<User, Partial<User> & Pick<User, 'id'>>({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    })
  })
});

export const { useGetUsersQuery, useGetUserByIdQuery, useUpdateUserMutation } = api;

const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error } = useGetUserByIdQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  const handleUpdate = () => {
    updateUser({ id: userId, name: 'Updated Name' });
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update User'}
      </button>
    </div>
  );
};
```