DROP TABLE IF EXISTS task;
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) UNIQUE,
    task_status VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);


DROP TABLE IF EXISTS task_list;
CREATE TABLE task_list (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) UNIQUE,
    task_list_status VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

DROP TABLE IF EXISTS task_list_mapping;
CREATE TABLE task_list_mapping (
    -- id SERIAL PRIMARY KEY,
    task_list_id INTEGER NOT NULL REFERENCES task_list(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    PRIMARY KEY(task_list_id, task_id)
);