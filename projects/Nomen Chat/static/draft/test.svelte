<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  console.log($page);
  if(browser && (!$page.data.pms.includes(new URL(location.href).hostname)||!$page.data.pms.includes(new URL(window.top.location.href).hostname))){
    location.href="/error/toperror"
  };
  let createBubble, setBubblel;
  if(browser){
    createBubble=function (side,{text,id}) {
      let bubble = document.createElement("div");
      bubble.innerHTML=`<div class="col-start-${[1,6][side]} col-end-8 p-3 rounded-lg">
                  <div class="flex flex-row items-center">
                    <div
                      class="flex items-center justify-center h-10 w-10 rounded-full bg-main flex-shrink-0 text-indigo-500 text-xs"
                    >
                      ${["AOOS","Me"][side]}
                    </div>
                    <div
                      class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                    >
                      <div id="${id}">${text}</div>
                    </div>
                  </div>
                </div>`;
      document.querySelector("#nomen-main-chat-body").appendChild(bubble)
    };
  }
</script>

<div class="flex h-screen antialiased text-gray-800">
    <div class="flex flex-row h-full w-full overflow-x-hidden">
      <div class="flex flex-col flex-auto h-full p-6">
        <div
          class="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
        >
          <div class="flex flex-col h-full overflow-x-auto mb-4">
            <div class="flex flex-col h-full">
              <div class="grid grid-cols-12 gap-y-2" id="nomen-main-chat-body">
                <div class="col-start-1 col-end-8 p-3 rounded-lg">
                  <div class="flex flex-row items-center">
                    <div
                      class="flex items-center justify-center h-10 w-10 rounded-full bg-main flex-shrink-0 text-indigo-500 text-xs"
                    >
                      AOOS
                    </div>
                    <div
                      class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl"
                    >
                      <div>Hey How are you today?</div>
                    </div>
                  </div>
                </div>
                <div class="col-start-6 col-end-13 p-3 rounded-lg">
                  <div class="flex items-center justify-start flex-row-reverse">
                    <div
                      class="flex items-center justify-center h-10 w-10 rounded-full bg-transparent flex-shrink-0 text-indigo-500"
                    >
                      Me
                    </div>
                    <div
                      class="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                    >
                      <div>I'm ok what about you?</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
          >
            <div class="flex-grow">
              <div class="relative w-full">
                <input
                  type="text"
                  class="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                />
                <button
                  class="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="ml-4">
              <button
                class="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
              >
                <span>Send</span>
                <span class="ml-2">
                  <svg
                    class="w-4 h-4 transform rotate-45 -mt-px"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>