<template>
  <div class="h-screen flex flex-col justify-center items-center">
    <h1 class="text-5xl font-bold mb-4">Kevin ToDo List</h1>
    <div class="flex gap-4 mb-4">
      <div class="flex mt-4 w-20 relative items-center">
        <div class="bg-blue-600 rounded-3xl px-2 py-1 text-white w-full">Tasks</div>
        <span class="rounded-full bg-white px-2 absolute right-1 text-blue-600">{{ tasks.length }}</span>
      </div>
      <div class="flex mt-4 w-32 relative items-center">
        <div class="bg-blue-600 rounded-3xl px-2 py-1 text-white w-full">Tasks Done</div>
        <span class="rounded-full bg-white px-2 absolute right-1 text-blue-600">{{ doneTasksCount }}</span>
      </div>
      <button :disabled="isButtonDisabled" class="flex mt-4 w-20 items-center bg-red-500 hover:bg-red-600" @click="deleteDoneTasks">
        <img src="@/assets/trash-can.svg" alt="Delete Icon" class="w-4 h-4 mx-2" />
        <span class="text-white">Tasks</span>
      </button>
    </div>
    <div v-if="isLoading" class="flex items-center justify-center">
      <!-- Nuxt.js logo spinner -->
      <img src="@/assets/nuxt-logo.svg" alt="Nuxt.js Logo" class="w-16 h-16 animate-spin-fast-pause" />
    </div>
    <!-- Display tasks -->
    <div v-else class="overflow-y-auto h-[21rem] w-[35rem]">
      <div v-for="task in tasks" :key="task.id" class="flex items-center relative p-4 m-2 border rounded-lg" @mouseover="handleMouseEnter(task.id)" @mouseleave="handleMouseLeave">
        <!-- Button to update task -->
        <button :disabled="isButtonDisabled" :class="{'bg-gray-400 hover:bg-gray-400': task.status === 'done', 'bg-green-500 hover:bg-green-600': task.status === 'todo', 'mr-4 text-white font-bold px-[0.38rem] rounded-full': true}" @click="updateTask(task.id, task.title, 'done')">&#10003;</button>
        <h2 :class="{'line-through text-gray-400': task.status === 'done', 'text-base font-semibold': true}">{{ task.title }}</h2>
        <!-- Button to delete task -->
        <button :disabled="isButtonDisabled" v-show="hoveredTaskId === task.id" class="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-full absolute right-4" @click="deleteTask(task.id)">
          <!-- SVG icon from file -->
          <img src="@/assets/trash-can.svg" alt="Delete Icon" class="w-[0.75rem] h-[0.75rem]" />
        </button>
      </div>
    </div>
    <!-- Form to create new task -->
    <div class="flex mt-4 w-96 relative items-center">
      <input v-model="newTask.title" @input="validateTitle" class="border focus:outline-blue-500 rounded-3xl p-4 w-full" placeholder="New Task Title" />
      <button :disabled="isButtonDisabled" class="absolute mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full right-1 bottom-2" @click="handleCreateTask">+</button>
    </div>
    <!-- Validation message -->
    <p v-if="showValidationMessage" class="text-red-500 mt-2">Task title cannot be empty</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const hoveredTaskId = ref<string | null>(null);
const tasks = ref<{ id: string; title: string; status: string }[]>([]);
const newTask = ref<{ title: string }>({ title: '' });
const isLoading = ref(true);
const isButtonDisabled = ref(false);
const showValidationMessage = ref(false);

const handleMouseEnter = (id: string) => {
  hoveredTaskId.value = id;
};

const handleMouseLeave = () => {
  hoveredTaskId.value = null;
};

const validateTitle = () => {
  const trimmedTitle = newTask.value.title.trim();
  const isValid = trimmedTitle.length > 0;
  isButtonDisabled.value = !isValid;
  showValidationMessage.value = !isValid;
};

const handleCreateTask = async () => {
  validateTitle();
  if (!isButtonDisabled.value) {
    await createTask(newTask.value.title, 'todo');
  }
};

const handleError = (error: Error | unknown) => {
  console.error('Error:', error);
};

const doneTasksCount = computed(() => {
  return tasks.value.filter((task) => task.status === 'done').length;
});

const fetchTasks = async () => {
  try {
    const taskData = await GqlTasks();
    tasks.value = taskData?.tasks || [];
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

const createTask = async (title: string, status: string) => {
  if (!title.trim()) return;
  try {
    isLoading.value = true;
    isButtonDisabled.value = true;
    const taskData = await GqlCreateTask({ title, status });
    tasks.value = taskData?.createTask || [];
    newTask.value.title = '';
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
    isButtonDisabled.value = false;
  }
};

const updateTask = async (id: string, title: string, status: string) => {
  try {
    isLoading.value = true;
    isButtonDisabled.value = true;
    const taskData = await GqlUpdateTask({ id, title, status });
    tasks.value = taskData?.updateTask || [];
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
    isButtonDisabled.value = false;
  }
};

const deleteTask = async (id: string) => {
  try {
    isLoading.value = true;
    isButtonDisabled.value = true;
    const taskData = await GqlDeleteTask({ id });
    tasks.value = taskData?.deleteTask || [];
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
    isButtonDisabled.value = false;
  }
};

const deleteDoneTasks = async () => {
  try {
    isLoading.value = true;
    isButtonDisabled.value = true;
    const taskData = await GqlDeleteDoneTasks();
    tasks.value = taskData?.deleteDoneTasks || [];
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
    isButtonDisabled.value = false;
  }
};

// Fetch initial tasks
fetchTasks();
</script>

<style>
@keyframes spin-fast-pause {
  0%, 80% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-fast-pause {
  animation: spin-fast-pause 1s linear infinite;
}
</style>