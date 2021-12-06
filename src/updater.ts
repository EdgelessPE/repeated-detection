import fs from "fs";
import path from "path";
import { resolve } from "path/posix";
import { config } from ".";
import { Package } from "./class";
import { log,keypress } from "./utils";

function hashGenerator(array: Array<Package>): any {
  let hash: any = {};
  array.forEach((item) => {
    hash[item.name] = item.category;
  });
  return hash;
}

function move(item: Package, category: string): boolean {
  const oldPath = path.join(config.NEWLY_ADDED, item.fullName),
    newPath = path.join(config.LOCAL_ROOT, category, item.fullName);
    fs.renameSync(oldPath, newPath);
  return !fs.existsSync(oldPath) && fs.existsSync(newPath);
}

function update(
  rootList: Array<Package>,
  newList: Array<Package>
): boolean {
  //生成 名称-分类 快查HASH
  let hash = hashGenerator(rootList);
  const getCategory = function (name: string): string | undefined {
    return hash[name];
  };
  //依次复制到指定目录
  let cate,succ=true;
  newList.forEach((item) => {
    cate = getCategory(item.name);
    if (cate) {
      if(move(item, cate)){
          log(`Info:Moved ${item.fullName} to ${cate}`)
      }
    } else {
      log(`Warning:Category not found : ${item.fullName}`);
      succ=false
    }
  });
  return succ
}

export async function solveUpdate(rootList: Array<Package>,
    newList: Array<Package>):Promise<null>{
        return new Promise(async (resolve)=>{
            if(!update(rootList,newList)){
                log("Warning:Please deal with that before press any key to continue");
                  await keypress();
                  await solveUpdate(rootList,newList)
                  resolve(null);
            }else{
                resolve(null)
            }
        })
    }