const getTaskList = (task_id:number) => {
    return {
        id: task_id,
        title: "task_test",
        status: "CREATED",
        created_at: new Date().toISOString(),
        tasks: []
    };
}

const getTask = (task_id:number) => {
    return {
        id: task_id,
        title: "task_test",
        status: "CREATED",
        created_at: new Date().toISOString()
    };
}

const getCreateTaskReq = () => {
    return {
        title: "task_test",
        status: "CREATED"
    };
}

const getCreateTaskListReq = () => {
    return {
        title: "task_list_test",
        status: "CREATED"
    };
}

const getCreateTaskInvalidReq = () => {
    return {
        title: "",
        status: "CREATED123",
        created_at : new Date().toISOString()
    };
}

const getCreateTaskListInvalidReq = () => {
    return {
        title: "",
        status: "CREATED123",
        created_at : new Date().toISOString(),
    };
}

const getAllTaskList = () => {
    return [
        {
            id: 1,
            title: "task_list_test_1",
            created_at: new Date().toISOString(),
            tasks: [getTask(1), getTask(2)]
        },
        {
            id: 2,
            title: "task_list_test_2",
            created_at: new Date().toISOString(),
            tasks: [getTask(3), getTask(4)]
        },
        {
            id: 3,
            title: "task_list_test_3",
            created_at: new Date().toISOString(),
            tasks: [getTask(4), getTask(5), getTask(6)]
        }
    ]
}

const getAllTask = () => {
    return [
        {
            id: 1,
            title: 'task_test_1',
            created_at : new Date()
        },
        {
            id: 2,
            title: 'task_test_2',
            created_at : new Date()
        },
        {
            id: 3,
            title: 'task_test_3',
            created_at : new Date()
        },
        {
            id: 4,
            title: 'task_test_4',
            created_at : new Date()
        },
        {
            id: 5,
            title: 'task_test_5',
            created_at : new Date()
        },
        {
            id: 6,
            title: 'task_test_6',
            created_at : new Date()
        },
    ]
}

export default {
    getTaskList,
    getTask,
    getCreateTaskReq,
    getCreateTaskListReq,
    getCreateTaskInvalidReq,
    getCreateTaskListInvalidReq,
    getAllTaskList,
    getAllTask
}