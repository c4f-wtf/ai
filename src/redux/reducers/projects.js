import {
    PROJECT_OPEN,
    PROJECT_CLOSE,
    PROJECT_CREATE,
    PROJECT_DELETE,
} from 'actions/projects.js';

const INITIAL_STATE = {
    currentProject: null,
    currentScenario: null,
    lastChangeProjects: 0,
};

const projects = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case PROJECT_OPEN: return openProject(state, action);
        case PROJECT_CLOSE: return closeProject(state, action);
        case PROJECT_CREATE: return createProject(state, action);
        case PROJECT_DELETE: return deleteProject(state, action);
        default: return state;
    }
};

function openProject(state, action) {
    return {
        ...state,
        currentProject: action.id,
        currentScenario: action.scenario,
    };
}

function closeProject(state, action) {
    return {
        ...state,
        currentProject: null,
        currentScenario: null,
    };
}

function createProject(state, action) {
    return {
        ...state,
        lastChangeProjects: action.timestamp,
    };
}

function deleteProject(state, action) {
    return {
        ...state,
        lastChangeProjects: action.timestamp,
    };
}

export default projects;
